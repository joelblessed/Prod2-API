const ordersRoutes = require("./orders");
const productsRoutes = require("./db")
const cartRoutes = require("./cart");
const wishlistRoutes = require("./wishlist");
const signUpRoutes = require("./signUp");
const signInRoutes = require("./signIn");
const formUploadRoutes = require("./formUpload");
const passwardResetRoutes = require("./passwardReset");



const express = require("express");
const axios = require("axios");
const fs = require("fs");
const multer = require("multer");
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
