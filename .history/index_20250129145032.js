const express = require("express");
const fs = require("fs");
const path = require("path");
const cors =require("cors")

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

const dbPath = path.join(__dirname, "db.json");
const cartPath = path.join(__dirname, "cart.json");

// Read db.json
app.get("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});

// Add a new Product to db.json
app.post("/products/", (req, res) => {
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

// Images
app.use("/images",express.static(path.join(__dirname,"public/images")));

// getFromCart
app.get("/cart", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.cart);
  });
});

// addToCart
app.post("/cart", (req, res) => {
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

// Increment cart*
app.put("/cart/:id/increment", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item
    let item = db.cart.find(item => item.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Increment the count
    item.count++;

    // Save updated data to db.json
    fs.writeFile(dbFile, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item count incremented", item });
    });
  });
});

// *API to Delete an Item by ID*
app.delete("/cart/:id", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item index
    const itemIndex = db.cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    // Remove the item
    db.cart.splice(itemIndex, 1);

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item deleted successfully" });
    });
  });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))