const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const ORDERS_FILE = path.join(__dirname, '../jsonFilesorders.json');
const SECRET_KEY = 'your-secret-key'; // In production, use environment variable

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Read orders from file
const readOrders = async () => {
  const data = await fs.readFile(ORDERS_FILE, 'utf8');
  return JSON.parse(data).orders;
};

// Write orders to file
const writeOrders = async (orders) => {
  await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2));
};

// Get all orders (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Forbidden" });
    
    const orders = await readOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (req.user.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const orders = await readOrders();
    const userOrders = orders.filter(order => order.user.userId === userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.patch('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    let orders = await readOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return res.status(404).json({ error: "Order not found" });
    if (orders[orderIndex].user.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (orders[orderIndex].status !== "Pending") {
      return res.status(400).json({ error: "Order cannot be canceled" });
    }
    
    orders[orderIndex].status = "Canceled";
    await writeOrders(orders);
    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as delivered
router.patch('/:orderId/deliver', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { deliveryDate } = req.body;
    let orders = await readOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return res.status(404).json({ error: "Order not found" });
    if (!req.user.isAdmin) return res.status(403).json({ error: "Forbidden" });
    if (orders[orderIndex].status === "Canceled") {
      return res.status(400).json({ error: "Cannot deliver canceled order" });
    }
    
    orders[orderIndex].status = "Delivered";
    orders[orderIndex].shipping.deliveryDate = deliveryDate || new Date().toISOString();
    await writeOrders(orders);
    
    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;