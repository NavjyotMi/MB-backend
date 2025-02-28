const Razorpay = require("razorpay");
const crypto = require("crypto");
const process = require("process");
const catchAsync = require("../utils/catchAsync");
const { Console } = require("console");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createPayment = catchAsync(async (req, res) => {
  // console.log("req body is hit", req.body);
  const options = {
    amount: req.body.totalamount * 100, // amount in paise (50000 paise = ₹500)
    currency: "INR",
    receipt: "order_rcptid_11",
    payment_capture: 1, // Auto-capture payment
  };
  // console.log("payment route is hit");
  const order = await instance.orders.create(options);
  // console.log(order);

  res.json(order);
});

module.exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  // console.log("the payment is successfull");
  const secret = process.env.RAZORPAY_KEY_SECRET; // Razorpay Secret Key
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.json({ message: "Payment successful", keyword: 1 });
  } else {
    res
      .status(400)
      .json({ message: "Payment verification failed", keyword: -1 });
  }
};
