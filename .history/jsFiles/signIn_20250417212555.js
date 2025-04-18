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
const JWT_SECRET = process.env.JWT_SECRET ;
const router = express.Router();

const app = express();

dotenv.config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Attach the decoded user data to the request
    next();
  });
};


app.use(express.json());
app.use(express.urlencoded({extended:true}))



const accountPath = path.join(__dirname, "../jsonFiles/account.json");

// Get all products
router.get('/AllProfiles', (req, res) => {
  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));
  res.json(db.users);
});

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
    const token = jwt.sign({ userId: user.id,role:user.role}, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token , role: user.role , id:user.id,username:user.userName});
  });
});

// *Protected Route Example*
router.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    fs.readFile(accountPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });

      let db = JSON.parse(data);
      const user = db.users.find(user => user.id === decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json(user);
    });

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


router.put('/updateProfile/:id', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));
  const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...req.body };
    fs.writeFileSync(accountPath, JSON.stringify(db, null, 2));
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


router.post('/viewedProducts', (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }

  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));

  // Ensure logs array exists
  if (!Array.isArray(db.logs)) db.logs = [];

  // Find latest log for the user
  const userLogs = db.logs.filter(log => log.userId === userId);
  const latestLog = userLogs[userLogs.length - 1];

  if (!latestLog) {
    return res.status(404).json({ error: 'No log found for this user' });
  }

  if (!Array.isArray(latestLog.viewedProducts)) {
    latestLog.viewedProducts = [];
  }

  const newViewed = {
    id: latestLog.viewedProducts.length + 1,
    productId,
    timestamp: new Date().toISOString()
  };

  latestLog.viewedProducts.push(newViewed);

  fs.writeFileSync(accountPath, JSON.stringify(db, null, 2));
  res.status(201).json(newViewed);
});



router.post('/logs', (req, res) => {
  const { userId,  } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }

  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));

  // Ensure logs array exists
  if (!Array.isArray(db.logs)) db.logs = [];

  // Find latest log for the user
  const userLogs = db.logs.filter(log => log.userId === userId);
  const latestLog = userLogs[userLogs.length - 1];

  if (!latestLog) {
    return res.status(404).json({ error: 'No log found for this user' });
  }

  if (!Array.isArray(latestLog.viewedProducts)) {
    latestLog.viewedProducts = [];
  }

  const newViewed = {
    id: latestLog.viewedProducts.length + 1,
    productId,
    timestamp: new Date().toISOString()
  };

  latestLog.viewedProducts.push(newViewed);

  fs.writeFileSync(accountPath, JSON.stringify(db, null, 2));
  res.status(201).json(newViewed);
});


router.get('/viewedProducts/:userId', (req, res) => {
  const { userId } = req.params;
  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));

  if (!Array.isArray(db.logs)) return res.status(404).json({ error: 'No logs found' });

  // Get logs for this user
  const userLogs = db.logs.filter(log => log.userId === userId);

  if (userLogs.length === 0) {
    return res.status(404).json({ error: 'No logs found for this user' });
  }

  // Get latest log
  const latestLog = userLogs[userLogs.length - 1];

  const viewedProducts = latestLog.viewedProducts || [];

  res.json(viewedProducts);
});


// router.post('/logs', (req, res) => {
//   const { userId, action } = req.body;
//   const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));
//   const newLog = {
//     id: db.logs.length + 1,
//     userId,
//     action,
//     timestamp: new Date().toISOString()
//   };
//   db.logs.push(newLog);
//   fs.writeFileSync(accountPath, JSON.stringify(db, null, 2));
//   res.status(201).json(newLog);
// });

router.get('/logs', (req, res) => {
  const db = JSON.parse(fs.readFileSync(accountPath));
  res.json(db.logs);
});

module.exports= router