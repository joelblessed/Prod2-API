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



const router= express.Router();

// *Sign In (Login User)*
app.post("/signin", async (req, res) => {
 const { identifier, password} = req.body;

   fs.readFile(accountPath, "utf8", async (err, data) => {
         if (err) return res.status(500).json({ error: "Error reading database" });

     let db = JSON.parse(data);
//     const user = db.users.find(user => user.email ===identifier || user.userName === identifier) 
   if (!user) return res.status(400).json({ message: "Invalid credentials" });
    

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     // Generate JWT token
//     const token = jwt.sign({ userId: user.id, role:user.role}, JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token , role: user.role});
//   });
// });

  
  module.exports = router;