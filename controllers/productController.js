const multer = require("multer");
const zod = require("zod");
const Product = require("../models/product");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { deleteImage } = require("../utils/deleteImage");
const product = require("../models/product");

const productSchema = zod.object({
  name: zod.string(),
  description: zod.string(),
  price: zod.number(),
  stock: zod.number(),
  category: zod.string(),
  seller: zod
    .string()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: "Invalid Seller ID",
    }),
});

module.exports.createProduct = catchAsync(async (req, res) => {
  const productData = req.body;
  console.log(productData);
  req.body.stock = Number(req.body.stock);
  req.body.price = Number(req.body.price);
  const { success } = await productSchema.safeParse(productData);
  const imageUrl = req.file;
  console.log("this is image url", imageUrl);

  // check if the image has been sent
  if (!imageUrl)
    throw new AppError(
      404,
      "Please add image of the product to proceed further"
    );

  //  if some fields are missing
  if (!success) {
    const publicId = imageUrl.filename || imageUrl.path.split("/").slice(-1)[0];
    console.log(publicId);

    await deleteImage(publicId);
    throw new AppError(500, "invalid input image file is deleted");
  }
  const finalObj = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    category: productData.category,
    imageUrl: imageUrl.path,
    seller: productData.seller,
  };
  const savedProduct = await Product.create(finalObj);

  res.status(200).send({
    status: "successfull",
    message: "yeah just checking man",
    data: { savedProduct },
  });
});

const productUpdateSchema = zod.object({
  _id: zod.string(),
  name: zod.string().optional(),
  description: zod.string().optional(),
  price: zod.number().optional(),
  stock: zod.number().optional(),
  category: zod.string().optional(),
  seller: zod
    .string()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: "Invalid Seller ID", // Validates that the seller ID is a valid ObjectId string
    }),
});

module.exports.updateProduct = catchAsync(async (req, res) => {
  const updateP = req.body;
  if (req.body.stock) req.body.stock = Number(req.body.stock);
  if (req.body.price) req.body.price = Number(req.body.price);

  console.log(req.body);
  const result = productUpdateSchema.safeParse(req.body);
  // console.log(success);

  if (!result.success) {
    console.error(result.error.format());
    throw new AppError(400, "some fields are missing");
  }

  const { _id, seller, ...updateFields } = updateP;

  // Update product only if the seller matches
  const updatedProduct = await Product.findOneAndUpdate(
    { _id, seller }, // Ensure seller owns the product
    updateFields,
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw new AppError(403, "You are not authorized to update this product");
  }

  res.status(200).json({
    status: "Success",
    message: "the product has been updated",
    data: { updatedProduct },
  });
});

module.exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid product ID");
  }

  const product = await Product.findOneAndDelete({ _id: id }).select(
    "imageUrl"
  );
  if (!product) throw new AppError(404, "Product not found");

  const cloudinaryUrl = product.imageUrl;
  // https://res.cloudinary.com/demo/image/upload/v1700000000/products/abcd1234.jpg
  console.log(cloudinaryUrl);
  const publicId = cloudinaryUrl.split("/").slice(-2).join("/").split(".")[0];
  console.log(publicId);
  await deleteImage(publicId);

  const [_, products] = await Promise.all([
    deleteImage(publicId).catch((err) =>
      console.error("Cloudinary Deletion Failed:", err)
    ),
    Product.find({}),
  ]);
  res.status(200).json({
    status: "success",
    message: "the product has been deleted",
    data: { products },
  });
});

module.exports.showAllProduct = catchAsync(async (req, res) => {
  // console.log(req.query);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 10;
  const sorting = req.query.sort === "desc" ? -1 : 1;
  const skip = limit * (page - 1);
  const productQuery = {};

  if (req.query.search) {
    productQuery.name = { $regex: req.query.search, $options: "i" };
  }
  if (req.query.category) {
    productQuery.category = { $regex: req.query.category, $options: "i" };
  }
  if (req.query.minvalue || req.query.maxvalue) {
    if (req.query.minvalue && req.query.maxvalue) {
      productQuery.$and = [
        { price: { $gte: Number(req.query.minvalue) } },
        { price: { $lte: Number(req.query.maxvalue) } },
      ];
    } else if (req.query.minvalue) {
      productQuery.price = { $gte: req.query.minvalue };
    } else if (req.query.maxvalue) {
      productQuery.price = { $lte: req.query.maxvalue };
    }
  }

  const totalProducts = await Product.countDocuments(productQuery);
  const totalPages = Math.ceil(totalProducts / limit);
  const products = await Product.find(productQuery)
    .limit(limit)
    .skip(skip)
    .sort({ price: sorting })
    .lean();

  res.json({
    message: "All your products",
    data: {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

module.exports.getProductbyId = catchAsync(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("why is this hitting getproductby id");
    throw new AppError(400, "Invalid product ID");
  }

  const product = await Product.findById({ _id: id });
  if (!product) throw new AppError(404, "Product not found");
  // console.log(product);
  res.status(200).json({
    status: "success",
    message: "Product succesffully sent",
    data: { product },
  });
});

module.exports.getCategory = catchAsync(async (req, res) => {
  console.log("this is hit");
  const categories = await Product.distinct("category");
  res.json({
    category: categories,
  });
});

// Get All product vendor wise
module.exports.getVendorProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError(404, "Invalid Id");

  const data = await Product.find({ seller: id });
  // console.log(data);
  res.status(200).json({
    status: "success",
    message: "Product received successfully",
    data,
  });
});
