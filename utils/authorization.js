const { verifyJwt } = require("../utils/jwtUtility");
const catchAsync = require("./catchAsync");
const AppError = require("./AppError");
module.exports.authenticate = catchAsync(async (req, res, next) => {
  let token = req.headers["authorization"];

  // check if it has a Bearer token
  if (!token) {
    // console.log("no token");
    throw new AppError(401, "No token");
  }

  token = token.split(" ")[1];

  // Checks for token
  if (!token) {
    // console.log("before access denied");
    throw new AppError(401, "before token Access Denied");
  }

  const verified_user = verifyJwt(token);

  //if authorization failed
  if (!verified_user) throw new AppError(401, "Access Denied");

  // adding some data to req.user
  req.user = {
    email: verified_user.email,
    _id: verified_user.user,
    role: verified_user.role,
  };

  next();
});
