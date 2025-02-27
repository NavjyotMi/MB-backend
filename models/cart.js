const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: String,
      imageUrl: String,
    },
  ],
  totalQuantity: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);
