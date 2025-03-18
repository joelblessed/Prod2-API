onst express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const CART_FILE = "cart.json";
const ORDERS_FILE = "orders.json";

// Helper function to read data from a JSON file
const readData = (file) => {
  try {
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return []; // Return an empty array if file doesn't exist or is empty
  }
};

// Helper function to write data to a JSON file
const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
};

// Get cart items
app.get("/cart", (req, res) => {
  const cart = readData(CART_FILE);
  res.json(cart);
});

// Add item to cart
router.post("/cart", (req, res) => {
  const cart = readData(CART_FILE);
  const item = req.body;
  cart.push(item);
  writeData(CART_FILE, cart);
  res.status(201).json({ message: "Item added to cart", item });
});

// Remove item from cart
router.delete("/cart/:id", (req, res) => {
  let cart = readData(CART_FILE);
  const { id } = req.params;
  cart = cart.filter((item) => item.id !== id);
  writeData(CART_FILE, cart);
  res.json({ message: "Item removed from cart" });
});

// Checkout endpoint (stores orders in orders.json)
router.post("/order", (req, res) => {
  const { orderData } = req.body;

  if (!orderData || !orderData.cart || orderData.cart.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  let orders = readData(ORDERS_FILE);
  orders.push(orderData);
  writeData(ORDERS_FILE, orders);

  // Clear the cart after successful checkout
  writeData(CART_FILE, []);

  res.status(201).json({ message: "Order placed successfully", order: orderData });
});

// Fetch all orders
router.get("/orders", (req, res) => {
  const orders = readData(ORDERS_FILE);
  res.json(orders);
});

module.exports = router;