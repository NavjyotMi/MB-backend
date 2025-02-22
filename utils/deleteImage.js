const cloudinary = require("./cloudinaryConfig"); // Import Cloudinary instance

module.exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("this is result", result); // { result: 'ok' } if successful
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
