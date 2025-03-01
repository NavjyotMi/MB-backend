const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const db = require("./db");
const app = express();
const cors = require("cors");
const Routes = require("./routes/routes");
const errorHandler = require("./utils/errorHandler");
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());
// connecting the database

db();
app.use("/api/v1", Routes);
app.use(errorHandler);
app.use((req, res, next) => {
  console.log("Request Path:", req.path);
  next();
});
app.listen(process.env.PORT, () => {
  console.log("the server is running");
});
