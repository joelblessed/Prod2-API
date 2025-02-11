const express = require("express");
const fs = require("fs");
const path = require("path");
const router= express.Router();
const dbPath = path.join(__dirname, "db.json");


// Read db.json
router.get("/products", (req, res) => {
    fs.readFile(dbPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      res.json(jsonData.products);
    });
  });
  
  // Add a new Product to db.json
  app.post("/newProducts/", (req, res) => {
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
  
  // Utility: Read products data from file
  const readProducts = () => {
    const rawData = fs.readFileSync(dbPath);
    const data = JSON.parse(rawData);
    return data.products;
  };
  
  // Utility: Write updated products back to file
  const writeProducts = (products) => {
    const data = { products };
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  };
  // Endpoint to get a single product by id
  app.get("/products/:id", (req, res) => {
    try {
      const products = readProducts();
      const id = parseInt(req.params.id, 10);
      const product = products.find((p) => p.id === id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Failed to read products data" });
    }
  });
  
  // PATCH endpoint to update a product partially
  app.patch("/updateProducts/:id", (req, res) => {
    try {
      const products = readProducts();
      const id = parseInt(req.params.id, 10);
      const index = products.findIndex((p) => p.id === id);
  
      if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Merge the existing product with the fields sent in the request body
      const updatedProduct = { ...products[index], ...req.body };
      products[index] = updatedProduct;
  
      // Write the updated products back to the file
      writeProducts(products);
  
      res.json(updatedProduct);
    } catch (err) {
      console.error("Error patching product:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  
  // *API to Delete an products by ID*
  app.delete("/productsRemoveItem/:id", (req, res) => {
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