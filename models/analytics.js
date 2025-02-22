const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  totalSales: { type: Number, required: true, default: 0 },
  totalRevenue: { type: Number, required: true, default: 0 },
  ordersCount: { type: Number, required: true, default: 0 },
  usersCount: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
