require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JSON_SERVER_URL = "http://localhost:5001"; // Link to cart.json server

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Fetch user's cart from json-server
app.get("/cart", authenticateToken, async (req, res) => {
  try {
    const response = await fetch(${JSON_SERVER_URL}/cart);
    const cart = await response.json();

    const userCart = cart.filter((item) => item.userId === req.user.userId);
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// Simulate MTN MoMo payment
app.post("/mtn-momo-payment", authenticateToken, (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ message: "Missing payment details" });
  }

  setTimeout(() => {
    res.json({ status: "success", message: "Payment received" });
  }, 2000);
});

// Save order after payment
app.post("/orders", authenticateToken, async (req, res) => {
  const { userId, paymentNumber, totalAmount, cart } = req.body;

  if (!userId || !paymentNumber || !totalAmount || !cart.length) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  try {
    // Save order to db.json
    await fetch(${JSON_SERVER_URL}/orders, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, paymentNumber, totalAmount, cart, date: new Date() }),
    });

    // Clear cart after checkout
    for (const item of cart) {
      await fetch(${JSON_SERVER_URL}/cart/${item.id}, {
        method: "DELETE",
      });
    }

    res.json({ message: "Order placed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order" });
  }
});

app.listen(PORT, () => console.log(Server running on port ${PORT}));