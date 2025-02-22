const Router = require("express");
const {
  signupHandler,
  signInHandler,
  getUserInfo,
  getUserAllDetails,
  updateUserInfo,
  updatePassword,
  deleteUser,
  promoteUser,
  getAllUser,
} = require("../controllers/userController");
const { authenticate } = require("../utils/authorization");
const { admin } = require("../middlewares/adminCheck");
const routes = Router();

routes.post("/signup", signupHandler);
routes.post("/login", signInHandler);
routes.get("/getuser", authenticate, getUserInfo);
routes.get("/aboutme", authenticate, getUserAllDetails);
routes.get("/getallusers", authenticate, admin, getAllUser);
routes.put("/updateme", authenticate, updateUserInfo);
routes.put("/updatepassword", authenticate, updatePassword);
routes.delete("/deleteuser/:id", authenticate, admin, deleteUser);
routes.put("/promote/:id", authenticate, admin, promoteUser);

module.exports = routes;
