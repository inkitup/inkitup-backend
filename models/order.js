const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  color: { type: String, required: true },
  customizations: { type: Array, default: [] },
  quantity: { type: Number, default: 1, min: 1 },
  customizedImages: {
    front: String,
    back: String,
  },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["paypal", "credit_card", "debit_card"],
    default: "paypal",
  },
  transactionId: { type: String, unique: true, sparse: true },
  paypalOrderId: { type: String, unique: true, sparse: true },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.model("Order", orderSchema);
