const express = require("express");
const axios = require('axios');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors =require("cors")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');  // UUID generation for unique identifiers
const bodyParser = require('body-parser');  // Parse incoming request bodies

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const SECRET_KEY = "your-secret-key"; // Change this in production


const app = express();

app.use(bodyParser.json({limit: "50mb"}));  // Support for JSON-encoded bodies
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
// app.use("upload", express.static("upload"))



const dbPath = path.join(__dirname, "db.json");
const cartPath = path.join(__dirname, "cart.json");
const accountPath = path.join(__dirname, "account.json");
const ordersPath = path.join(__dirname, "orders.json");
const wishlistPath = path.join(__dirname, "wishlist.json");



const express = require("express");

const cors = require("cors")

// const ordersRoutes = require("./orders");
// const productsRoutes = require("./db")
// const cartRoutes = require("./cart");
// const wishlistRoutes = require("./wishlist");
// const signUpRoutes = require("./signUp");
// const signInRoutes = require("./signIn");
// const formUploadRoutes = require("./formUpload");
// const passwardResetRoutes = require("./passwardReset");
// const paymentRoutes = require("./payment");

// app.use(cors({
//     origin:"http://localhost:3000",
//     methods:"GET, POST, PUT, DELETE",
//     allowedHeaders:"Content-Type, Athorization"

// }))
app.use(cors())

// app.use("/", ordersRoutes);
// app.use("/", productsRoutes);
// app.use("/", cartRoutes);
// app.use("/", wishlistRoutes);
// app.use("/", signUpRoutes);
// app.use("/s", signInRoutes);
// app.use("/", formUploadRoutes);
// app.use("/", passwardResetRoutes);
// app.use("/", paymentRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





