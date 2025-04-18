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


router.post('/logs', (req, res) => {
  const { userId, action } = req.body;
  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));

  // Initialize logs if not present
  if (!db.logs) db.logs = {};

  // Initialize user log array
  if (!Array.isArray(db.logs[userId])) db.logs[userId] = [];

  const newLog = {
    id: db.logs[userId].length + 1,
    action,
    timestamp: new Date().toISOString()
  };

  db.logs[userId].push(newLog);
  fs.writeFileSync(accountPath, JSON.stringify(db, null, 2));
  res.status(201).json(newLog);
});

router.post('/viewedProducts', (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }

  const db = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));

  // Check if user logs exist
  if (!db.logs || !Array.isArray(db.logs[userId])) {
    return res.status(404).json({ error: 'No log found for this user' });
  }

  const userLogs = db.logs[userId];
  const latestLog = userLogs[userLogs.length - 1];

  if (!latestLog) {
    return res.status(404).json({ error: 'No log found for this user' });
  }

  // Ensure viewedProducts array exists
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




router.get('/logs', (req, res) => {
  const db = JSON.parse(fs.readFileSync(accountPath));
  res.json(db.logs);
});

module.exports= router