const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const dotenv = require("dotenv");
const router = express.Router();
const jwt = require("jsonwebtoken");

const accountPath = path.join(__dirname, "../jsonFiles/account.json");
dotenv.config();


const SECRET_KEY = process.env.JWT_SECRET 
const getUsers = () => JSON.parse(fs.readFileSync("./jsonFiles/account.json", "utf8")).users;
const saveUsers = (users) => fs.writeFileSync("./jsonFiles/account.json", JSON.stringify({ users }, null, 2));
const users = getUsers()

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// *Sign Up (Register User)*
router.post("/signup", async (req, res) => {
  const {
    email,
    password,
    userName,
    fullName,
    phoneNumber,
    city,
    country,
    wallet,
    address,
    gender,
    role,
    dateOfBirth,
    referralCode,
    referredBy,
    signUpOn,
    location,
  } = req.body;

  fs.readFile(accountPath, "utf8", async (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);

    // Check if user exists
   
  
    // generate unique referral code
    const generateReferralCode = () =>crypto.randomBytes(4).toString("hex").toUpperCase();

    // check if referral code is valid
    
    if (referralCode && !users.find((user)=>user.referralCode ===referralCode)){
      return res.status(400).json({message: "invalid referral code"});
    }
    // Hash password and add user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: db.users.length + 1,
      email,
      password: hashedPassword,
      userName,
      fullName,
      phoneNumber,
      country,
      city,
      address,
      gender,
      referralCode: generateReferralCode(),
      referredBy:referralCode || null,
      wallet,
      discount: 10,
      role,
      dateOfBirth,
      signUpOn,
      location,
    };
    db.users.push(newUser);

    fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });
      res.json({ message: "User registered successfully", referralCode: newUser.referralCode });
    });
  });
});

// Apply 5% referral reward (ONLY for first purchase)
router.post("/apply-reward", verifyToken, (req, res) => {
  const { userId, amountPaid } = req.body;
  let users = getUsers();

  const referredUser = users.find((user) => user.id === userId);
  if (!referredUser) return res.status(404).json({ message: "User not found" });

  // Check if it's the first purchase
  if (referredUser.hasMadeFirstPurchase) {
    return res.json({ message: "Referral reward only applies to the first purchase." });
  }

  if (referredUser.referredBy) {
    const referrer = users.find((user) => user.referralCode === referredUser.referredBy);
    if (referrer) {
      const reward = (5 / 100) * amountPaid;
      referrer.wallet += reward;
      referredUser.hasMadeFirstPurchase = true; // Mark as first purchase done
      saveUsers(users);
      return res.json({ message: `Reward applied! ${referrer.name} earned $${reward.toFixed(2)}` });
    }
  }

  res.json({ message: "No referrer found for this user." });
});

// // Endpoint to apply reward to referrer when referred user makes a purchase
// router.post("/apply-reward", (req, res) => {
//   const { userId } = req.body;
//   let users = getUsers();

//   const referredUser = users.find((user) => user.id === userId);
//   if (!referredUser) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Check if the user was referred by someone
//   if (referredUser.referredBy) {
//     const referrer = users.find((user) => user.referralCode === referredUser.referredBy);
//     if (referrer) {
//       referrer.wallet += 100; // Reward referrer with $5 or equivalent credit
//       saveUsers(users);
//       return res.json({ message: `Reward applied! ${referrer.name} now has $${referrer.wallet} reward balance.` });
//     }
//   }

//   res.json({ message: "No referrer found for this user." });
// });

// Endpoint to add a product to the user's wishlist



module.exports = router;
