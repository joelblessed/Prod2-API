const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const   router = express.Router();

const ordersFilePath = path.join(__dirname, '../jsonFiles/orders.json');
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


// Place order
router.post('/order', authenticateToken, (req, res) => {
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

module.exports = router;