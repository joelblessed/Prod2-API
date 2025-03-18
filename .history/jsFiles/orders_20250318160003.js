const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const dbFilePath = path.join(__dirname, 'db.json');
const ordersFilePath = path.join(__dirname, 'orders.json');
const SECRET_KEY = 'your_secret_key'; // Replace with your actual secret key

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get user cart
app.get('/cart', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const userCart = db.carts.find(cart => cart.userId === req.user.id);
  if (userCart) {
    res.json(userCart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

// Place order
app.post('/order', authenticateToken, (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFilePath, 'utf-8'));
  const newOrder = {
    id: orders.length + 1,
    userId: req.user.id,
    ...req.body.orderData,
  };
  orders.push(newOrder);
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
  res.status(201).json(newOrder);
});

// Clear cart
app.delete('/cart/:productId', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const userCart = db.carts.find(cart => cart.userId === req.user.id);
  if (userCart) {
    userCart.items = userCart.items.filter(item => item.id !== parseInt(req.params.productId));
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json(userCart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});