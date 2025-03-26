require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());
const CART_FILE = "./jsonFiles/cart.json";


const WISHLIST_FILE = "./jsonFiles/wishlist.json";
// File path for orders
const ORDERS_FILE = path.join(__dirname, "../jsonFiles/orders.json");

// Helper function to read orders from file
const readOrders = () => {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] })); // Create file with { "orders": [] } if it doesn't exist
    }
    const data = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading orders file:", error);
    return { orders: [] }; // Return default structure if file is corrupted
  }
};

// Helper function to write orders to file
const writeOrders = (orders) => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders }, null, 2)); // Save as { "orders": [...] }
  } catch (error) {
    console.error("Error writing orders file:", error);
  }
};

// Validate JWT token
const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using JWT secret
    return decoded; // Return decoded token payload if valid
  } catch (error) {
    console.error("Invalid token:", error);
    return null; // Return null if token is invalid
  }
};

// 🟢 Place a new order
router.post("/order", (req, res) => {
  const { orderData } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

  if (!token || !validateToken(token)) {
    return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
  }

  if (!orderData || !orderData.user || !orderData.cart || !orderData.shipping) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { orders } = readOrders(); // Destructure orders from the file
  const newOrder = {
    id: Date.now(), // Unique order ID
    ...orderData,
    status: "Pending", // Default status
    date: new Date().toISOString(),
  };

  orders.push(newOrder);
  writeOrders(orders);

  res.status(201).json({ message: "Order placed successfully", order: newOrder });
});

// 🟡 Get all orders (for testing purposes)
router.get("/orders", (req, res) => {
  const { orders } = readOrders(); // Destructure orders from the file
  res.json({ orders });
});

module.exports = router;