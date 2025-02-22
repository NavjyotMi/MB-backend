module.exports.admin = (req, res, next) => {
  const user = req.user.role;
  if (user == "user")
    return res.json({
      message: "access denied",
    });
  next();
};
