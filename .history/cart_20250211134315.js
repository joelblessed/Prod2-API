const express = require("express");
const fs = require("fs");
const path = require("path");
const router= express.Router();
const cartPath = path.join(__dirname, "cart.json");

// getFromCart
app.get("/cart", (req, res) => {
    fs.readFile(cartPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      res.json(jsonData.cart);
    });
  });
  
  // addToCart
  app.post("/addToCart", (req, res) => {
    fs.readFile(cartPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      const item = { id: jsonData.cart.length + 1, ...req.body };
      jsonData.cart.push(item);
  
      fs.writeFile(cartPath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving data" });
        res.status(201).json(item);
      });
    });
  });
  
  // Utility: Read products data from file
  const readProductsCart = () => {
    const rawData = fs.readFileSync(cartPath);
    const data = JSON.parse(rawData);
    return data.products;
  };
  
  // Utility: Write updated products back to file
  const writeProductsCart = (products) => {
    const data = { products };
    fs.writeFileSync(cartPath, JSON.stringify(data, null, 2));
  };
  // Endpoint to get a single product by id
  app.get("/cart/:id", (req, res) => {
    try {
      const products = readProductsCart();
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
  app.patch("/updatCart/:id", (req, res) => {
    try {
      const products = readProductsCart();
      const id = parseInt(req.params.id, 10);
      const index = products.findIndex((p) => p.id === id);
  
      if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Merge the existing product with the fields sent in the request body
      const updatedProduct = { ...products[index], ...req.body };
      products[index] = updatedProduct;
  
      // Write the updated products back to the file
      writeProductsCart(products);
  
      res.json(updatedProduct);
    } catch (err) {
      console.error("Error patching product:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  
  // Increment cart*
  app.put("/cart/:id/increment", (req, res) => {
    fs.readFile(cartPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      let db = JSON.parse(data);
      const itemId = parseInt(req.params.id);
  
      // Find the item
      let item = db.cart.find((item) => item.id === itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });
  
      // Increment the count
      item.quantity++;
  
      // Save updated data to db.json
      fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving database" });
  
        res.json({ message: "Item count incremented", item });
      });
    });
  });
  
  // decrement cart*
  app.put("/cart/:id/decrement", (req, res) => {
    fs.readFile(cartPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      let db = JSON.parse(data);
      const itemId = parseInt(req.params.id);
  
      // Find the item
      let item = db.cart.find((item) => item.id === itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });
  
      // decrement the count
      item.quantity--;
  
      // Save updated data to db.json
      fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving database" });
  
        res.json({ message: "Item count decremented", item });
      });
    });
  });
  
  // *API to Delete an cart by ID*
  app.delete("/cartRemoveItem/:id", (req, res) => {
    fs.readFile(cartPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      let db = JSON.parse(data);
      const itemId = parseInt(req.params.id);
  
      // Find the item index
      const itemIndex = db.cart.findIndex((item) => item.id === itemId);
      if (itemIndex === -1)
        return res.status(404).json({ message: "Item not found" });
  
      // Remove the item
      db.cart.splice(itemIndex, 1);
  
      // Save updated data to db.json
      fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving database" });
  
        res.json({ message: "Item deleted successfully" });
      });
    });
  });

  module