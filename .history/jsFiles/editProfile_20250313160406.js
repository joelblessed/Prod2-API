
const router = express.Router();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const dbFilePath = path.join(__dirname, 'db.json');
const SECRET_KEY = 'your_secret_key'; // Replace with your actual secret key

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get user profile
app.get('/api/profile/:id', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const user = db.users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Update user profile
app.put('/api/updateProfile/:id', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...req.body };
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


});



module.exports =router