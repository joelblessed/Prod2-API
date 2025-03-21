const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const app = express();

const dbFilePath = path.join(__dirname, "../jsonFiles/db.json");

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

// delete a product by ID
router.delete('/deleteProduct/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const productIndex = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    db.products.splice(productIndex, 1);
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

router.get("/products/:ownerId", (req, res) => {
  const db =  JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const ownerId = req.params.ownerId;

  // Filter products by ownerId
  const filteredProducts = db.products.filter(
    (product) => String(product.ownerId) === ownerId
  );

  res.json(filteredProducts);
  
});

// *Like a product (Per User)*
router.patch("/products/:id/like", (req, res) => {
  const { userId,username } = req.body; // User ID from frontend
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const data = JSON.parse(fs.readFileSync(dbFilePath));
  const productIndex = data.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  let product = data.products[productIndex];

  // Only like if the user hasn't liked it already
  if (!product.likedBy.includes(userId)) {
    product.likes += 1;
    product.likedBy.push(userId);
  }

   fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  res.json({ message: "Liked", likes: product.likes, likedBy: product.likedBy });
});

// *Dislike (remove like) for a specific user*
router.patch("/products/:id/dislike", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const data = JSON.parse(fs.readFileSync(dbFilePath));
  const productIndex = data.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  let product = data.products[productIndex];

  // Remove like if user has already liked
  if (product.likedBy.includes(userId)) {
    product.likes -= 1;
    product.likedBy = product.likedBy.filter(id => id !== userId); // Remove user from likedBy array
  }

 fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  res.json({ message: "Disliked", likes: product.likes, likedBy: product.likedBy });
});


module.exports =router