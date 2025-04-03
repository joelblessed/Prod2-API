const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const router = express.Router()

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database paths
const DB_PATH = path.join(__dirname, './jsonFiles/db.json');
const ACCOUNT_PATH = path.join(__dirname, './jsonFiles/account.json');

// Helper functions
const readJSON = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const accounts = readJSON(ACCOUNT_PATH);
  const user = accounts.users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
};

// API Endpoints

// 1. Product Endpoints
router.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  const products = readJSON(DB_PATH).products;

  let filtered = [...products];
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  res.json(filtered);
});

// 2. Wishlist Endpoints
router.get('/api/wishlist', authenticate, (req, res) => {
  const accounts = readJSON(ACCOUNT_PATH);
  const user = accounts.users.find(u => u.id === req.user.id);
  res.json(user.wishlist);
});

app.post('/api/wishlist/:productId', authenticate, (req, res) => {
  const { productId } = req.params;
  const productIdNum = Number(productId);
  
  const accounts = readJSON(ACCOUNT_PATH);
  const userIndex = accounts.users.findIndex(u => u.id === req.user.id);
  
  if (!accounts.users[userIndex].wishlist.includes(productIdNum)) {
    accounts.users[userIndex].wishlist.push(productIdNum);
    writeJSON(ACCOUNT_PATH, accounts);
  }
  
  res.json({ success: true });
});

router.delete('/api/wishlist/:productId', authenticate, (req, res) => {
  const { productId } = req.params;
  const productIdNum = Number(productId);
  
  const accounts = readJSON(ACCOUNT_PATH);
  const userIndex = accounts.users.findIndex(u => u.id === req.user.id);
  
  accounts.users[userIndex].wishlist = accounts.users[userIndex].wishlist.filter(
    id => id !== productIdNum
  );
  
  writeJSON(ACCOUNT_PATH, accounts);
  res.json({ success: true });
});

// 3. Guest Wishlist Endpoints
router.get('/api/guest/wishlist', (req, res) => {
  const { deviceId } = req.query;
  const accounts = readJSON(ACCOUNT_PATH);
  res.json(accounts.guestWishlists[deviceId] || []);
});

app.post('/api/guest/wishlist/:productId', (req, res) => {
  const { productId } = req.params;
  const { deviceId } = req.body;
  const productIdNum = Number(productId);
  
  const accounts = readJSON(ACCOUNT_PATH);
  accounts.guestWishlists[deviceId] = accounts.guestWishlists[deviceId] || [];
  
  if (!accounts.guestWishlists[deviceId].includes(productIdNum)) {
    accounts.guestWishlists[deviceId].push(productIdNum);
    writeJSON(ACCOUNT_PATH, accounts);
  }
  
  res.json({ success: true });
});

router.delete('/api/guest/wishlist/:productId', (req, res) => {
  const { productId } = req.params;
  const { deviceId } = req.body;
  const productIdNum = Number(productId);
  
  const accounts = readJSON(ACCOUNT_PATH);
  if (accounts.guestWishlists[deviceId]) {
    accounts.guestWishlists[deviceId] = accounts.guestWishlists[deviceId].filter(
      id => id !== productIdNum
    );
    writeJSON(ACCOUNT_PATH, accounts);
  }
  
  res.json({ success: true });
});

// 4. Sync Endpoint
.post('/api/wishlist/sync', authenticate, (req, res) => {
  const { productIds, deviceId } = req.body;
  
  const accounts = readJSON(ACCOUNT_PATH);
  const userIndex = accounts.users.findIndex(u => u.id === req.user.id);
  
  // Merge and deduplicate
  accounts.users[userIndex].wishlist = [
    ...new Set([...accounts.users[userIndex].wishlist, ...productIds])
  ];
  
  // Clear guest wishlist
  if (deviceId && accounts.guestWishlists[deviceId]) {
    delete accounts.guestWishlists[deviceId];
  }
  
  writeJSON(ACCOUNT_PATH, accounts);
  res.json({ wishlist: accounts.users[userIndex].wishlist });
});

module.exports = router