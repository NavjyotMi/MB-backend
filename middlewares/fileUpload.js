const multer = require("multer");
const cloudinary = require("../utils/cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// const storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, "./uploads");
//   },
//   filename: function (req, file, callback) {
//     const ext = path.extname(file.originalname);
//     const d = new Date();
//     callback(null, `${file.fieldname}${d.getTime()}${ext}`);
//   },
// });

const upload = multer({ storage: storage });
module.exports = upload;
