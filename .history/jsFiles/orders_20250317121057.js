const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Express app
const app = express();
const router = express.Router();  

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to the orders.json file
const ordersFilePath = path.join(__dirname, "../jsonFiles/orders.json");

// Helper function to read orders from the file
const readOrders = () => {
  if (!fs.existsSync(ordersFilePath)) {
    fs.writeFileSync(ordersFilePath, "[]"); // Create an empty array if the file doesn't exist
  }
  const data = fs.readFileSync(ordersFilePath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write orders to the file
const writeOrders = (orders) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
};

// Checkout route
router.post("/api/checkout", (req, res) => {
  const { user, totalAmount, cart, shipping } = req.body;

  try {
    // Read existing orders
    const orders = readOrders();

    // Create a new order
    const newOrder = {
      id: Date.now().toString(), // Generate a unique ID
      user,
      totalAmount,
      cart,
      shipping,
      date: new Date().toISOString(), // Add the current date and time
    };

    // Add the new order to the list
    orders.push(newOrder);

    // Save the updated orders list to the file
    writeOrders(orders);

    // Respond with success message and the new order
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Checkout failed. Please try again." });
  }
});

// Get all orders route
router.get("/api/orders", (req, res) => {
  try {
    const orders = readOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

// Get order by ID route
router.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  try {
    const orders = readOrders();
    const order = orders.find((order) => order.id === id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order." });
  }
});

// Delete order route
router.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  try {
    // Read existing orders
    let orders = readOrders();

    // Find the index of the order to delete
    const orderIndex = orders.findIndex((order) => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Remove the order from the list
    orders.splice(orderIndex, 1);

    // Save the updated orders list to the file
    writeOrders(orders);

    res.status(200).json({ message: "Order deleted successfully!" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order." });
  }
});

module.exports = router;