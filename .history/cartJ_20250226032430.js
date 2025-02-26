const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// htp://localhost:3001
// Load db.json
const dbFile = "cart.json";
const loadDB = () => JSON.parse(fs.readFileSync(dbFile, "utf-8"));
const saveDB = (db) => fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf-8");

// Get user's cart by userId
app.get("/cart", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  const db = loadDB();
  const userCart = db.cart.find((c) => c.userId === Number(userId));

  res.json(userCart ? [userCart] : []);
});

// Update or create user's cart
app.patch("/cart/:userId", (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID is required" });

  const db = loadDB();
  const userIndex = db.cart.findIndex((c) => c.userId === Number(userId));

  if (userIndex !== -1) {
    // Update existing cart
    db.cart[userIndex].items = items;
  } else {
    // Create new cart entry
    db.cart.push({ userId: Number(userId), items });
  }

  saveDB(db);
  res.json({ success: true, items });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});