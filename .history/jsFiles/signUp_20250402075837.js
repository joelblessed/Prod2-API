const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const dotenv = require("dotenv");
const router = express.Router();
const accountPath = path.join(__dirname, "../jsonFiles/account.json");
dotenv.config();


const getUsers = () => JSON.parse(fs.readFileSync("./jsonFiles/account.json", "utf8")).users;
const saveUsers = (users) => fs.writeFileSync("./jsonFiles/account.json", JSON.stringify({ users }, null, 2));
const user = getUsers()

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
    referralCode,
    referredBy,
    discount,
    signUpOn,
    location,
  } = req.body;

  fs.readFile(accountPath, "utf8", async (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);

    // Check if user exists
    if (db.users.some((user) => user.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }
  
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
      phone,
      country,
      city,
      wallet,
      address,
      gender,
      referralCode: generateReferralCode(),
      referredBy:referralCode || null,
      discount:referralCode ? 10 : 0,
      role,
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



// Endpoint to apply reward to referrer when referred user makes a purchase
router.post("/apply-reward", (req, res) => {
  const { userId } = req.body;
  let users = getUsers();

  const referredUser = users.find((user) => user.id === userId);
  if (!referredUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the user was referred by someone
  if (referredUser.referredBy) {
    const referrer = users.find((user) => user.referralCode === referredUser.referredBy);
    if (referrer) {
      referrer.rewardBalance += 5; // Reward referrer with $5 or equivalent credit
      saveUsers(users);
      return res.json({ message: `Reward applied! ${referrer.name} now has $${referrer.rewardBalance} reward balance.` });
    }
  }

  res.json({ message: "No referrer found for this user." });
});



module.exports = router;
