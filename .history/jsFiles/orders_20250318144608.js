const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { router } = require("json-server");

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample in-memory storage (Replace with database later)
let cart = [];
let orders = [];

// Endpoint to fetch cart items
app.get("/cart", (req, res) => {
  res.json(cart);
});

// Endpoint to add an item to the cart
router.post("/cart", (req, res) => {
  const item = req.body;
  cart.push(item);
  res.status(201).json({ message: "Item added to cart", item });
});

// Endpoint to remove an item from the cart
router.delete("/cart/:id", (req, res) => {
  const { id } = req.params;
  cart = cart.filter((item) => item.id !== id);
  res.json({ message: "Item removed from cart" });
});

// Checkout endpoint
router.post("/order", (req, res) => {
  const { orderData } = req.body;

  if (!orderData || !orderData.cart || orderData.cart.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  orders.push(orderData);
  cart = []; // Clear cart after successful order

  res.status(201).json({ message: "Order placed successfully", order: orderData });
});

// Fetch orders
router.get("/orders", (req, res) => {
  res.json(orders);
});

module.exports = router;