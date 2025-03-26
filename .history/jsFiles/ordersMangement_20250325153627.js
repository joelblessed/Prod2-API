const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const router
const ordersFilePath = "./jsonFiles/orders.json";

app.use(cors());
app.use(bodyParser.json());

// Middleware to check authentication token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  next();
};

// Read orders from file
const getOrders = () => {
  const data = fs.readFileSync(ordersFilePath);
  return JSON.parse(data).orders;
};

// Write updated orders to file
const saveOrders = (orders) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify({ orders }, null, 2));
};

// *1. Fetch all orders (Requires Token)*
router.get("/orders", authenticateToken, (req, res) => {
  res.json(getOrders());
});

// *2. Fetch orders by userId (Requires Token)*
router.get("/orders/:userId", authenticateToken, (req, res) => {
  const { userId } = req.params;
  const orders = getOrders().filter((order) => order.user.userId == userId);
  res.json(orders);
});

// *3. Cancel an Order (Requires Token)*
router.patch("/orders/cancel/:orderId", authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id == orderId);

  if (orderIndex === -1) return res.status(404).json({ message: "Order not found" });

  orders[orderIndex].status = "Canceled";
  saveOrders(orders);
  res.json({ message: "Order canceled successfully" });
});

// *4. Mark an Order as Delivered and Store Delivery Date*
router.patch("/orders/deliver/:orderId", authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const deliveryDate = new Date().toISOString();
  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id == orderId);

  if (orderIndex === -1) return res.status(404).json({ message: "Order not found" });

  orders[orderIndex].status = "Delivered";
  orders[orderIndex].shipping.deliveryDate = deliveryDate;
  saveOrders(orders);
  res.json({ message: "Order delivered successfully", deliveryDate });
});

// *Start Server*
module.exports = router;