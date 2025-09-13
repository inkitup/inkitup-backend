const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  color: { type: String, required: true },
  customizations: { type: Array, default: [] },
  id: { type: Number, required: true },
  designId: { type: String },
  quantity: { type: Number, default: 1, min: 1 },
  customizedImages: {
    front: String,
    back: String
  },
  createdAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema]
});

module.exports = mongoose.model("Cart", cartSchema);