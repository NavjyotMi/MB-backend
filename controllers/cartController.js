const catchAsync = require("../utils/catchAsync");
const Cart = require("../models/cart");
const zod = require("zod");
const { default: mongoose } = require("mongoose");
const AppError = require("../utils/AppError");
const cart = require("../models/cart");

const addToCartSchema = zod.object({
  userId: zod
    .string()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: "invalid user id",
    }),
  productId: zod
    .string()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: "invalid user id",
    }),
  sellerId: zod
    .string()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: "invalid user id",
    }),
  name: zod.string(),
  price: zod.number(),
  quantity: zod.number(),
});
module.exports.addToCart = catchAsync(async (req, res) => {
  const { userId, productId, name, price, quantity, sellerId } = req.body;
  // step 1: we get the item details(id, name, price, quantity, seller id) and user id
  const { success, error } = addToCartSchema.safeParse({
    userId,
    productId,
    name,
    price,
    quantity,
    sellerId,
  });

  if (!success)
    throw new AppError(401, error.errors.map((err) => err.message).join(", "));
  // step 2 check if we have a cart on users id
  let cart = await Cart.findOne({ userId });
  // step 3 if not then create one and add this to the cart
  if (!cart) {
    const cartItem = {
      userId,
      items: [
        {
          productId,
          quantity,
          price,
          sellerId,
        },
      ],
      totalQuantity: 1,
      totalPrice: price * quantity,
      sellerId,
    };
    cart = await Cart.create(cartItem);
    return res.status(200).json({
      status: "success",
      message: "Item added to the cart Successfully",
      data: cart,
    });
  }
  // step 4 if have one then check the item is already present it the cart if present just update the cart
  const updatedCart = await Cart.findOneAndUpdate(
    {
      _id: cart._id,
      "items.productId": productId,
    },
    {
      $inc: {
        "items.$.quantity": quantity,
        totalQuantity: quantity,
        totalPrice: price * quantity,
      },
    },
    { new: true }
  );

  // step 5 if not then push the item to the cart
  if (!updatedCart) {
    cart = await Cart.findByIdAndUpdate(
      cart._id,
      { $push: { items: { productId, quantity, price, sellerId } } },
      {
        $inc: {
          totalQuantity: quantity,
          totalPrice: price * quantity,
        },
      },
      { new: true }
    );
  } else {
    cart = updatedCart;
  }

  res.status(200).json({
    status: "success",
    message: "Item added to the cart Successfully",
    data: cart,
  });
});

module.exports.getCart = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError(400, "Invalid cart id");
  let cart = await Cart.findOne({ userId: id });
  console.log(cart);

  res
    .status(200)
    .json({ status: "success", message: "retrieved all the cart", cart });
});

// update the cart
module.exports.updateCart = catchAsync(async (req, res) => {
  // will receive cartId(as parameter), productId, quantity,price
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError(400, "Invalid cart id");
  const cart = await Cart.findOne({ _id: id });

  if (!cart) throw new AppError(404, "Cart not found");

  // Find index of the product in cart
  const itemIndex = cart.items.findIndex((item) =>
    item.productId.equals(req.body.productId)
  );

  if (itemIndex !== -1) {
    // Product exists, update quantity
    cart.items[itemIndex].quantity += req.body.quantity;
  }

  // Update total quantity and price
  cart.totalQuantity += req.body.quantity;
  cart.totalPrice += req.body.quantity * cart.items[itemIndex].price;
  console.log("cart", cart);

  // Save the updated cart
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart updated successfully",
    data: cart,
  });
});

// remove the cart
module.exports.removeCart = catchAsync(async (req, res) => {});
