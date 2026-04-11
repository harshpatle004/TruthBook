const express = require("express");
const connectDB = require("./databse/db");
const app = express();
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/auth");
const userRoute = require("./routes/userRoute");
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);

app.listen(5000, () => {
  connectDB();
  console.log("app is running on port 5000");
});
