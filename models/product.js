const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  review: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: {
        type: Number,
        required: true,
        default: 0,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  tags: [{ type: String }],
  buyers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  totalSell: { type: Number, default: 0 },
  totalQuantitySold: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", productSchema);
