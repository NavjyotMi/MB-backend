const { Router } = require("express");
const {
  createPayment,
  verifyPayment,
} = require("../controllers/paymentController");
const routes = Router();

routes.post("/createpayment", createPayment);
routes.post("/verifypayment", verifyPayment);

module.exports = routes;
