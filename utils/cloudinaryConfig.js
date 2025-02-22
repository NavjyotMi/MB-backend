const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Your Cloudinary cloud name
  api_key: process.env.API_KEY, // Your Cloudinary API key
  api_secret: process.env.API_SECRET, // Your Cloudinary API secret
});

module.exports = cloudinary;
