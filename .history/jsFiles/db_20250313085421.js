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
  
  // Add a new Product to db.json
  router.post("/newProducts/", (req, res) => {
    fs.readFile(dbPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      const product = { id: jsonData.products.length + 1, ...req.body };
      jsonData.products.push(product);
  
      fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving data" });
        res.status(201).json(product);
      });
    });
  });
  
  // Get a single product by ID
  router.get('/products/:id', (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const product = db.products.find(p => p.id === parseInt(req.params.id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  });
 // ...existing code...

// Route to handle product update by ID
router.put("/update/:id", upload.array("images", 11), (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedData = req.body;
  const files = req.files;

  // Read the existing products from db.json
  const dbPath = path.join(__dirname, "../jsonFiles/db.json");
  let db = { products: [] };

  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  }

  // Find the product by ID
  const productIndex = db.products.findIndex((product) => product.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Update the product details
  const updatedProduct = {
    ...db.products[productIndex],
    ...updatedData,
    price: parseFloat(updatedData.price),
    quantity: parseInt(updatedData.quantity),
    numberInStock: parseInt(updatedData.numberInStock),
    discount: parseFloat(updatedData.discount),
    likes: parseInt(updatedData.likes),
    brand: JSON.parse(updatedData.brand),
    location: JSON.parse(updatedData.location),
    images: files.length > 0 ? files.map((file) => `/images/${file.filename}`) : db.products[productIndex].images,
  };

  db.products[productIndex] = updatedProduct;

  // Save the updated products back to db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ message: "Product updated successfully!", product: updatedProduct });
});

// ...existing code...
  // *API to Delete an products by ID*
  router.delete("/productsRemoveItem/:id", (req, res) => {
    fs.readFile(dbPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      let db = JSON.parse(data);
      const itemId = parseInt(req.params.id);
  
      // Find the item index
      const itemIndex = db.products.findIndex((item) => item.id === itemId);
      if (itemIndex === -1)
        return res.status(404).json({ message: "Item not found" });
  
      // Remove the item
      db.products.splice(itemIndex, 1);
  
      // Save updated data to db.json
      fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving database" });
  
        res.json({ message: "product deleted successfully" });
      });
    });
  });

  module.exports = router;