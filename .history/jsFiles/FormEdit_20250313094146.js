const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const app = express();
const PORT = 5000;
const dbFilePath = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all products
router.get('/products', (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  res.json(db.products);
});

// Get a single product by ID
router.get('/products/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Update a product by ID
router.put('/updateProduct/:id', upload.array('images'), (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const productIndex = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    const updatedProduct = { ...db.products[productIndex], ...JSON.parse(req.body.product) };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      updatedProduct.images = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    }

    db.products[productIndex] = updatedProduct;
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

module.exports =router