const express = require("express");
const upload = require("../middlewares/fileUpload");
const {
  createProduct,
  deleteProduct,
  updateProduct,
  getProductbyId,
  getCategory,
  getVendorProduct,
} = require("../controllers/productController");
const { authenticate } = require("../utils/authorization");
const adminOnly = require("../middlewares/adminCheck");

routes = express.Router();
routes.get("/category", getCategory);
routes.post(
  "/upload",
  authenticate,
  adminOnly.admin,
  upload.single("imageUrl"),
  createProduct
);
routes.put("/updateproduct", authenticate, adminOnly.admin, updateProduct);

routes.delete(
  "/deleteproduct/:id",
  authenticate,
  adminOnly.admin,
  deleteProduct
);
routes.get("/:id", getProductbyId);
routes.get("/vendor/:id", getVendorProduct);
module.exports = routes;
