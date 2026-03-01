const axios = require("axios");
const paypalConfig = require("../config/paypal");
const Order = require("../models/order");
const Cart = require("../models/cart");

// Generate PayPal Access Token
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`,
  ).toString("base64");

  try {
    const response = await axios.post(
      `${paypalConfig.getApiUrl()}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
};

// Create PayPal Order
exports.createPayPalOrder = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Authentication required. Please login first." });
    }

    const { items, totalAmount } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const accessToken = await getAccessToken();

    // Prepare items for PayPal
    const paypalItems = items.map((item) => ({
      name: item.product || "Custom Product",
      description: item.color ? `Color: ${item.color}` : "",
      unit_amount: {
        currency_code: paypalConfig.currency,
        value: (item.price || 0).toFixed(2),
      },
      quantity: item.quantity.toString(),
    }));

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: paypalConfig.currency,
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: paypalConfig.currency,
                value: totalAmount.toFixed(2),
              },
            },
          },
          items: paypalItems,
          description: "InkItUp Custom Products Order",
        },
      ],
      application_context: {
        brand_name: "InkItUp",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-cancel`,
      },
    };

    const response = await axios.post(
      `${paypalConfig.getApiUrl()}/v2/checkout/orders`,
      orderPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Save order to database with PayPal Order ID
    const order = new Order({
      userId: userId,
      items: items,
      totalAmount: totalAmount,
      paymentStatus: "pending",
      paymentMethod: "paypal",
      paypalOrderId: response.data.id,
    });

    await order.save();

    res.json({
      success: true,
      id: response.data.id,
      orderId: order._id,
      links: response.data.links,
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({
      message: "Failed to create PayPal order",
      error: error.message,
    });
  }
};

// Capture PayPal Payment
exports.capturePayment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Authentication required. Please login first." });
    }

    const { paypalOrderId } = req.body;
    const userId = req.user.userId;

    if (!paypalOrderId) {
      return res.status(400).json({ message: "PayPal Order ID is required" });
    }

    const accessToken = await getAccessToken();

    // Capture the payment
    const captureResponse = await axios.post(
      `${paypalConfig.getApiUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (captureResponse.data.status === "COMPLETED") {
      // Update order status in database
      const order = await Order.findOne({
        paypalOrderId: paypalOrderId,
        userId: userId,
      });

      if (order) {
        order.paymentStatus = "completed";
        order.transactionId =
          captureResponse.data.purchase_units[0].payments.captures[0].id;
        order.completedAt = new Date();
        await order.save();

        // Clear the user's cart after successful payment
        await Cart.updateOne({ userId: userId }, { $set: { items: [] } });

        return res.json({
          success: true,
          message: "Payment captured successfully",
          order: order,
          transactionId: order.transactionId,
        });
      }
    }

    res.status(400).json({
      message: "Payment capture failed",
      status: captureResponse.data.status,
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).json({
      message: "Failed to capture payment",
      error: error.message,
    });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// Get All Orders for User
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ userId: userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
};

// Update Order Shipping Address
exports.updateOrderShippingAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { shippingAddress } = req.body;
    const userId = req.user.userId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: userId, paymentStatus: "completed" },
      { shippingAddress: shippingAddress },
      { new: true },
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or payment not completed" });
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error updating shipping address:", error);
    res.status(500).json({
      message: "Failed to update shipping address",
      error: error.message,
    });
  }
};
