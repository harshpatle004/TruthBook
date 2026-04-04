
const express = require("express");
const connectDB = require("./databse/db");
const app = express()
const dotenv = require("dotenv").config()
const authRoutes = require("./routes/auth")

app.use(express.json())

app.use("/api/auth",authRoutes)

app.listen(5000,()=>{
    connectDB()
    console.log("app is running")
})  

