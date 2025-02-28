const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shippingInfo: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },

    zipCode: {
      type: Number,
      required: true,
    },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      productStatus: {
        type: String,
        enum: ["pending", "delivered"],
        default: "pending",
      },
    },
  ],
  subtotal: { type: Number, required: true },
  discount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "delivered"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
