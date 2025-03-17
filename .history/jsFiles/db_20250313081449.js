const express = require("express");
const fs = require("fs");
const path = require("path");
const router= express.Router();
const dbPath = path.join(__dirname, "../jsonFiles/db.json");


// Read db.json
router.get("/products", (req, res) => {
    fs.readFile(dbPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      res.json(jsonData.products);
    });
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
app.put('/products/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const productIndex = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    db.products[productIndex] = { ...db.products[productIndex], ...req.body };
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json(db.products[productIndex]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});
  module.exports = router;