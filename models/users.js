const mongoose = require("mongoose");

const user = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true,
    lowecase: true,
    maxlength: 15,
    minlength: 3,
  },
  lname: {
    type: String,
    required: true,
    trim: true,
    lowecase: true,
    maxlength: 15,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "This email is already used"],
  },
  password: {
    type: String,
    minlength: [
      6,
      "Please enter a password which is minimum six character long",
    ],
    default: null,
    select: false,
  },
  oauthProvider: { type: String }, // e.g., 'google'
  oauthId: { type: String },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  dob: {
    type: Date,
    require: false,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  phoneNumber: {
    type: Number,
    trim: true,
  },
  accountStatus: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "active",
  },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
});

const User = mongoose.model("User", user);
module.exports = User;
