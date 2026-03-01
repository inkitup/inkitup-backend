const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const paymentController = require("../controller/paymentController");

// Create PayPal Order
router.post("/create-order", auth, paymentController.createPayPalOrder);

// Capture PayPal Payment
router.post("/capture-payment", auth, paymentController.capturePayment);

// Get Order Details
router.get("/order/:orderId", auth, paymentController.getOrderDetails);

// Get All Orders for User
router.get("/orders", auth, paymentController.getUserOrders);

// Update Shipping Address
router.put(
  "/order/:orderId/shipping",
  auth,
  paymentController.updateOrderShippingAddress,
);

module.exports = router;
