const AppError = require("./AppError");
const errorHandler = function (err, req, res, next) {
  console.log(err);
  // console.log("if error is reaching here");
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = errorHandler;
