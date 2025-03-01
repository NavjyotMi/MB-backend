const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Order = require("../models/order");
const User = require("../models/users");
const Product = require("../models/product");
const sendEmail = require("../utils/transporter");
const z = require("zod");
const mongoose = require("mongoose");

const orderSchema = z.object({
  userId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid user ID",
  }),
  shippingInfo: z.object({
    street: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string(),
  }),
  products: z.array(
    z.object({
      productId: z
        .string()
        .refine((value) => mongoose.Types.ObjectId.isValid(value), {
          message: "Invalid product ID",
        }),
      sellerId: z
        .string()
        .refine((value) => mongoose.Types.ObjectId.isValid(value), {
          message: "Invalid Seller ID",
        }),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      price: z.number().min(0, "Price must be a positive value"),
    })
  ),
  subtotal: z.number().min(0, "Subtotal must be a positive value"),
  discount: z
    .number()
    .min(0, "Discount must be a positive value")
    .default(0)
    .optional(),
  totalAmount: z.number().min(0, "Total amount must be a positive value"),
});

module.exports.createOrder = catchAsync(async (req, res) => {
  const data = req.body;

  const parseddate = orderSchema.safeParse(data);

  if (!parseddate.success) {
    throw new AppError(401, "there is some parsing error");
  }
  const order = {
    userId: data.userId,
    shippingInfo: {
      street: data.shippingInfo.street,
      city: data.shippingInfo.city,
      state: data.shippingInfo.state,
      country: data.shippingInfo.country,
      zipCode: data.shippingInfo.zipCode,
    },
    products: [...data.products],
    subtotal: data.subtotal,
    totalAmount: data.totalAmount,
    status: data.status,
  };

  const orderCreation = await Order.create(order);
  // money should be added to each vendors and product's documents

  for (let getproduct of orderCreation.products) {
    const { quantity, price, sellerId, productId } = getproduct; // ✅ Extract values

    const finalprice = quantity * price;

    // ✅ Update seller's total revenue & total orders
    const promise1 = User.findByIdAndUpdate(
      sellerId, // ✅ No need to wrap in { _id: sellerId }
      {
        $inc: {
          totalRevenue: finalprice,
          totalOrders: quantity,
          stock: -quantity,
        },
      }
    );

    // ✅ Update product's total sales & quantity sold
    const promise2 = Product.findByIdAndUpdate(
      productId,
      { $inc: { totalSell: quantity, totalOrders: quantity } } // ✅ Fix incorrect field updates
    );

    await Promise.all([promise1, promise2]); // ✅ Run updates in parallel for efficiency
  }

  res.status(200).json({
    status: "success",
    message: "Order created Succesfully",
  });
});

// Get only pending orders
module.exports.getVendorOrder = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(400, "Invalid vendor ID"));
  }

  const vendorOrder = await Order.aggregate([
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.sellerId": new mongoose.Types.ObjectId(id),
        "products.productStatus": "pending",
      },
    },
    {
      $group: {
        _id: "$_id",
        products: { $push: "$products" },
        shippingInfo: { $first: "$shippingInfo" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Fetched all the orders ",
    data: vendorOrder,
  });
}); //admin

module.exports.deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(400, "Invalid vendor ID"));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError(404, "Order not found"));
  }

  if (order.userId.toString() !== userId && req.user.role !== "admin") {
    return next(
      new AppError(403, "You are not authorized to delete this order")
    );
  }

  if (order.status !== "pending") {
    return next(
      new AppError(400, "Cannot delete an order that has been shipped")
    );
  }

  const del = await Order.findByIdAndDelete({ id });
  if (!del) throw new AppError(404, "Order not found");
  res
    .status(200)
    .json({ status: "success", message: "Order deleted successfully" });
}); //admin

module.exports.updateOrderStatus = catchAsync(async (req, res) => {
  // we get the order id through params and shipping status and sellerId  through the req.body
  const { id } = req.params;
  const { shippingStatus, sellerId, productId, userId } = req.body;
  // step 1 get the order details from the backend
  let orderDetails = await Order.findById(id);

  if (!orderDetails) throw new AppError(404, "Order not found");
  console.log(orderDetails);

  let allDelivered = true;
  let productName = "";

  orderDetails.products.forEach((product) => {
    // console.log(product);

    if (
      product.productId.toString() === productId &&
      product.sellerId.toString() === sellerId
    ) {
      product.productStatus = "delivered";
      productName = product.name;
    }
    if (product.productStatus !== "delivered") {
      allDelivered = false;
    }
  });

  if (allDelivered) {
    orderDetails.status = "delivered";

    const user = await User.findById({ _id: userId }).select("email");
    console.log(user);
    // ✅ Send final delivery email
    await sendEmail(
      // user.email,
      "parthshukla9569@gmail.com",
      "Your order has been delivered!",
      `Your entire order #${id} has been successfully delivered. Thank you for shopping with us!`
    );
  }

  orderDetails = await orderDetails.save();

  res.status(200).json({
    status: "success",
    message: "Order status updated and email sent (if required).",
    data: orderDetails,
  });
}); //vendor

// getalldetails
module.exports.getOrderInfo = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError(400, "Invalid vendor ID");

  const vendorOrders = await Order.find({
    "products.sellerId": id,
    "products.productStatus": { $in: ["pending", "delivered"] },
  }).select("products quantity totalAmount status createdAt");

  if (!vendorOrders.length)
    new AppError(404, "No orders found for this vendor");

  res.status(200).json({
    status: "success",
    message: "Fetched vendor orders successfully",
    data: vendorOrders,
  });
}); //vendor

module.exports.getUserOrderDetails = catchAsync(async (req, res) => {
  const { id } = req.params; // Use params instead of body
  console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError(400, "Invalid Order ID");

  const order = await Order.findById(id)
    .populate("products.productId", "name price images") // Include product details
    .populate("products.sellerId", "name"); // Include seller details

  console.log(order);
  if (!order) throw new AppError(404, "Order not found");
  // ✅ Ensure only the order owner or admin can view details
  if (order.userId._id.toString() !== req.user.id && req.user.role !== "admin")
    AppError(403, "You are not authorized to view this order");

  res.status(200).json({
    status: "success",
    data: order,
  });
}); //userpov
