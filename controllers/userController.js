const zod = require("zod");
const User = require("../models/users");
const { hashedPassword, comparePassword } = require("../utils/authentication");
const { createJwt } = require("../utils/jwtUtility");
const catchAsync = require("../utils/catchAsync");
const { Error } = require("mongoose");
const AppError = require("../utils/AppError");

// zod Schema to signup
const signupSchema = zod.object({
  fname: zod.string().min(2).max(15).trim(),
  lname: zod.string().min(2).max(15).trim(),
  email: zod.string().email().trim(),
  password: zod.string().min(6),
  gender: zod.enum(["male", "female"]),
});

// User Registation
module.exports.signupHandler = catchAsync(async (req, res) => {
  const incommingData = req.body;
  const { success } = signupSchema.safeParse(incommingData);
  if (!success) {
    throw new AppError(
      400,
      parsedData.error.errors[0].message || "Please Enter valid credentials"
    );
  }

  const user = await User.findOne({ email: incommingData.email }).select("_id");

  if (user) {
    throw new AppError(409, "User Already Exists");
  }

  const finalHashedPassword = await hashedPassword(incommingData.password);

  const cleanData = {
    fname: incommingData.fname,
    lname: incommingData.lname,
    email: incommingData.email,
    gender: incommingData.gender,
    password: finalHashedPassword,
  };
  const userCreated = await User.create(cleanData);

  const jwt = createJwt({
    user: userCreated._id,
    role: userCreated.role,
    email: userCreated.email,
  });

  res.status(201).json({
    status: "Success",
    message: "User created Succesfully",
    token: jwt,
    user: {
      user: userCreated._id,
      role: userCreated.role,
      email: userCreated.email,
    },
  });
});

// zod schema for signin
const signInZod = zod.object({
  email: zod.string().email().trim(),
  password: zod.string().min(6),
});

// Login Handler
module.exports.signInHandler = catchAsync(async (req, res) => {
  const incommingData = req.body;

  const { success } = signInZod.safeParse(incommingData);
  // checks for whether the incoming data has all the required field
  if (!success) throw new AppError(400, "Email & Password is required");

  // try to find the user and if found return only password _id and role
  const user = await User.findOne({
    email: incommingData.email,
  }).select("+password _id role email");

  // if the user is not found
  if (!user) {
    throw new AppError(404, "the user doesn't exist");
  }

  // compares the password
  const auth = await comparePassword(incommingData.password, user.password);
  // if authentication fails
  if (!auth) {
    throw new AppError(401, "Incorrect Credentials");
  }
  // JWT creation

  const jwt = createJwt({
    user: user._id,
    role: user.role,
    email: user.email,
  });

  // final sending of data
  res.json({
    status: "Success",
    message: "you are succefully loged in",
    jwt,
    user: { user: user._id, role: user.role, email: user.email },
  });
});

// Get the user info
module.exports.getUserInfo = catchAsync(async (req, res) => {
  const { _id } = req.user;

  const users = await User.findById(_id).select(
    "fname lname gender dob accountStatus"
  );

  if (!users) {
    throw new AppError(404, "User not found");
  }
  return res.status(200).json({
    status: "succsess",
    message: "here is your message",
    user: users,
  });
});

// for about me section

module.exports.getUserAllDetails = catchAsync(async (req, res) => {
  const { _id } = req.user;

  // Fetch all user data, including sensitive details
  const userData = await User.findById(_id).select(
    "fname lname email gender dob accountStatus address phoneNumber orders"
  );

  // If user not found, return an error
  if (!userData) {
    throw new AppError(404, "User not found");
  }

  return res.status(200).json({
    status: "success",
    message: "Here is your complete profile information",
    user: userData,
  });
});

module.exports.updateUserInfo = catchAsync(async (req, res) => {
  const { _id } = req.user;
  const incommingData = req.body;

  if (incommingData.dob && isNaN(Date.parse(incommingData.dob))) {
    throw new AppError(400, "Invalid date format");
  }

  if (incommingData.address && typeof incommingData.address !== "object") {
    throw new AppError(400, "Address should be an object");
  }

  const updatedValue = {};
  if (incommingData.lname) updatedValue.lname = incommingData.lname;
  if (incommingData.fname) updatedValue.fname = incommingData.fname;
  if (incommingData.gender) updatedValue.gender = incommingData.gender;
  if (incommingData.dob) updatedValue.dob = incommingData.dob;
  if (incommingData.phoneNumber)
    updatedValue.phoneNumber = incommingData.phoneNumber;
  if (incommingData.address) updatedValue.address = incommingData.address;

  const updatedUser = await User.findByIdAndUpdate(
    { _id },
    { $set: updatedValue },
    { new: true, runValidators: true }
  );
  if (!updatedUser) throw new AppError(404, "User Not Found");

  return res.status(200).json({
    message: "Successfully updated",
    updateduser: {
      ...updatedUser._doc,
      dob: updatedUser.dob ? updatedUser.dob.toISOString().split("T")[0] : null,
    },
  });
});

module.exports.updatePassword = catchAsync(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword) {
    throw new AppError(400, "Both old and new passwords are required");
  }
  //match old password

  const user = await User.findById(req.user._id).select(
    " +password -_id -fname -lname -gender -dob -address -role -accountStatus -email"
  );

  const auth = await comparePassword(oldpassword, user.password);

  if (!auth) throw new AppError(404, "Incorrect password");
  //hash new password

  const finalPassword = await hashedPassword(newpassword);

  //update the password

  const password = { password: finalPassword };
  const updatePass = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $set: password },
    { new: true, runValidators: true }
  ).select("email _id role");

  //create new jwt

  const newJwt = createJwt({
    email: req.user.email,
    role: req.user.role,
    _id: req.user._id,
  });

  //send the jwt to the user

  res.status(200).json({
    status: "success",
    message: "succesfully Updated the password",
    newJwt,
  });
});

module.exports.resetePassword = catchAsync(async (req, res) => {});

module.exports.logout = async (req, res) => {
  res.json({
    status: "succes",
    message: "Logged Out Succesfully",
  });
};

//Manage Users

module.exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  // console.log(par);
  if (!id) throw new AppError(404, "Please give a userId to delete");

  const deletedUser = await User.findByIdAndDelete({ _id: id });

  if (deletedUser == null) throw new AppError(404, "User not found");

  res.status(200).json({ status: "success", message: "the user is deleted" });
});

module.exports.promoteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const upgraded = await User.findByIdAndUpdate(
    { _id: id },
    { role: "admin" },
    { new: false }
  );
  if (!upgraded) throw new AppError(404, "User not found");

  res.status(200).json({
    status: "success",
    message: "Succefully upgraded the user",
  });
});

module.exports.getAllUser = catchAsync(async (req, res) => {
  const users = await User.find({}).select("fname lname email role _id");

  if (!users.length) {
    throw new AppError(404, "No users found");
  }

  res.status(200).json({
    status: "success",
    message: "You successfully getting all the memebers",
    users,
  });
});
