const { Router } = require("express");
const routes = Router();
const {
  addToCart,
  getCart,
  updateCart,
} = require("../controllers/cartController");

routes.post("/add", addToCart);
routes.get("/:id", getCart);
routes.put("/:id", updateCart);

module.exports = routes;
