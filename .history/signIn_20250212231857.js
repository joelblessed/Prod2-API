const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const router= express.Router();
const accountPath = path.join(__dirname, "account.json");


// Dummy users (Replace with a database)
const users = [
  { id: 1, username: "admin", email: "admin@example.com", password: bcrypt.hashSync("1234", 10) },
  { id: 2, username: "user1", email: "user1@example.com", password: bcrypt.hashSync("password", 10) }
];

// JWT Secret (use a strong secret in production)


// Login route to authenticate and issue JWT token
app.post("/api/login", (req, res) => {
  const { identifier, password } = req.body;

  // Find user by username or email
  const user = users.find(
    (u) => (u.username === identifier || u.email === identifier)
  );

  if (user && bcrypt.compareSync(password, user.password)) {
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expiration (1 hour)
    );

    res.json({ success: true, token, user });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// Protect routes with JWT middleware
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({ message: "Access denied" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

app.get("/api/protected", authenticateJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
  
  module.exports = router;