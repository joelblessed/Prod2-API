const express = require("express");
const axios = require("axios");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const router= express.Router();

router.get("/profile", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      fs.readFile(accountPath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading database" });
  
        let db = JSON.parse(data);
        const user = db.users.find((user) => user.id === decoded.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
  
        res.json({ email: user.email });
      });
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });
  
  module.exports = router;