const { Router } = require("express");
const { authenticate } = require("../utils/authorization");
const { admin } = require("../middlewares/adminCheck");
const {
  createOrder,
  getOrderInfo,
  getUserOrderDetails,
  getVendorOrder,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const routes = Router();

routes.post("/createorder", authenticate, createOrder);
routes.get("/:id", authenticate, getUserOrderDetails);
routes.get("/vendor/:id", authenticate, admin, getOrderInfo);
routes.get("/orderpending/:id", authenticate, admin, getVendorOrder);
routes.put("/updateorder/:id", updateOrderStatus);

module.exports = routes;
