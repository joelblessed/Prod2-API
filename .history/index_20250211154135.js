const ordersRoutes = require("./orders");
const productsRoutes = require("./db")
const cartRoutes = require("./cart");
const wishlistRoutes = require("./wishlist");
const signUpRoutes = require("./signUp");
const signInRoutes = require("./signIn");
const formUploadRoutes = require("./formUpload");
const passwardResetRoutes = require("./passwardReset");



const express = require("express");

const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid"); // UUID generation for unique identifiers
const bodyParser = require("body-parser"); // Parse incoming request bodies
const app = express();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const SECRET_KEY = "your-secret-key"; // Change this in production

app.use(bodyParser.json({ limit: "50mb" })); // Support for JSON-encoded bodies
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
// app.use("upload", express.static("upload"))

const dbPath = path.join(__dirname, "db.json");
const cartPath = path.join(__dirname, "cart.json");
const accountPath = path.join(__dirname, "account.json");
const ordersPath = path.join(__dirname, "orders.json");
const wishlistPath = path.join(__dirname, "wishlist.json");

app.use("/", ordersRoutes);
app.use("/", productsRoutes);
app.use("/", cartRoutes);
app.use("/", wishlistRoutes);
app.use("/", signUpRoutes);
app.use("/", signInRoutes);
app.use("/", formUploadRoutes);
app.use("/", passwardResetRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
