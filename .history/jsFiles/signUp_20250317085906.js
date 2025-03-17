const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const router= express.Router();
const accountPath = path.join(__dirname, "../jsonFiles/account.json");
dotenv.config();




// *Sign Up (Register User)*
router.post("/signup", async (req, res) => {
    const {
      email,
      password,
      userName,
      fullName,
      phone,
      city,
      country,
      wallet,
      address,
      gender,
      role,
      signUpOn,
      
    } = req.body;
  
    fs.readFile(accountPath, "utf8", async (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      let db = JSON.parse(data);
  
      // Check if user exists
      if (db.users.some((user) => user.email === email)) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash password and add user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: db.users.length + 1,
        email,
        password: hashedPassword,
        userName,
        fullName,
        phone,
        country,
        city,
        wallet,
        address,
        gender,
        role,
      };
      db.users.push(newUser);
  
      fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving database" });
        res.json({ message: "User registered successfully" });
      });
    });
  });
  
  module.exports = router