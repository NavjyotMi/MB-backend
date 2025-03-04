const express = require("express");
const route = express.Router();
const userRouter = require("../routes/userRoutes");
const productRouter = require("./productRoutes");
const { showAllProduct } = require("../controllers/productController");
const cartRouter = require("./cartRoutes");
const paymentRoute = require("./paymentRoutes");
const orderRoute = require("./orderRoutes");
route.get("/", showAllProduct);
route.get("/search", showAllProduct);
route.use("/user", userRouter);
route.use("/product", productRouter);
route.use("/cart", cartRouter);
route.use("/payment", paymentRoute);
route.use("/order", orderRoute);
module.exports = route;
// https://mb-backend-x7k5.onrender.com
