const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File path for orders
const ORDERS_FILE = path.join(__dirname, "orders.json");

// Helper function to read orders from file
const readOrders = () => {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([])); // Create file if it doesn't exist
    }
    const data = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading orders file:", error);
    return [];
  }
};

// Helper function to write orders to file
const writeOrders = (orders) => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error("Error writing orders file:", error);
  }
};

// Mock token validation (replace with real JWT validation in production)
const validateToken = (token) => {
  // In a real application, you would validate the token using a library like jsonwebtoken
  return token === "valid-token"; // Replace with actual token validation logic
};

// 🟢 Place a new order
app.post("/order", (req, res) => {
  const { orderData } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

  if (!token || !validateToken(token)) {
    return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
  }

  if (!orderData || !orderData.user || !orderData.cart || !orderData.shipping) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const orders = readOrders();
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
app.get("/orders", (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

module