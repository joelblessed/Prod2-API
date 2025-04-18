const express = require("express");
const fs = require("fs");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";




const accountPath = path.join(__dirname, "account.json");


const router= express.Router();

// *Sign In (Login User)*
router.post("/signin", async (req, res) => {
 const { identifier, password} = req.body;

   fs.readFile(accountPath, "utf8", async (err, data) => {
         if (err) return res.status(500).json({ error: "Error reading database" });

     let db = JSON.parse(data);
    const user = db.users.find(user => user.email ===identifier || user.userName === identifier) 
   if (!user) return res.status(400).json({ message: "Invalid credentials" });
    

   // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

     // Generate JWT token
    const token = jwt.sign({ userId: user.id, role:user.role}, JWT_SECRET, { expiresIn: "1h" });
     res.json({ token , role: user.role});
  });
 });

  
  module.exports = router;