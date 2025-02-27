const { Router } = require("express");
const routes = Router();
const {
  addToCart,
  getCart,
  updateCart,
  removeCart,
} = require("../controllers/cartController");

routes.post("/add", addToCart);
routes.get("/:id", getCart);
routes.put("/:id", updateCart);
routes.delete("/:id", removeCart);

module.exports = routes;
