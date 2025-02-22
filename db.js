const mongoose = require("mongoose");

async function db() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("the database is connected");
  } catch (error) {
    console.log(error);
  }
}
module.exports = db;
