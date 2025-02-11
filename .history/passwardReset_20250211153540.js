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
const router= express.Router();
const accountPath = path.join(__dirname, "account.json");
dotenv.config();


const SECRET_KEY = "your-secret-key"; // Change this in production


// Fake Email Sender (Use real SMTP for production)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password",
    },
  });
  
  // *1. Forgot Password: Generate Reset Link*
  app.post("/forgot-password", (req, res) => {
    const { email } = req.body;
  
    fs.readFile(accountPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ message: "Error reading database" });
  
      let db = JSON.parse(data);
      let user = db.users.find((u) => u.email === email);
      if (!user) return res.status(400).json({ message: "User not found" });
  
      // Generate Reset Token (Valid for 15 minutes)
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });
      const resetLink = `http://localhost:3000/reset-password/${token}`;
  
      // Send Email
      transporter.sendMail({
        from: "your-email@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click the link to reset your password: ${resetLink}`,
      });
  
      res.json({ message: "Password reset link sent to email." });
    });
  });
  
  // *2. Reset Password: Validate Token & Update Password*
  app.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const email = decoded.email;
  
      fs.readFile(accountPath, "utf8", async (err, data) => {
        if (err)
          return res.status(500).json({ message: "Error reading database" });
  
        let db = JSON.parse(data);
        let user = db.users.find((u) => u.email === email);
        if (!user)
          return res
            .status(400)
            .json({ message: "Invalid token or user not found" });
  
        // Hash the new password
        user.password = await bcrypt.hash(newPassword, 10);
  
        fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
          if (err)
            return res.status(500).json({ message: "Error updating password" });
          res.json({ message: "Password updated successfully" });
        });
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid or expired token" });
    }
  });
  