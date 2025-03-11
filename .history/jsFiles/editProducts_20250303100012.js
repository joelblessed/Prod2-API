const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000; // Same port as db.json server

app.use(cors());
app.use(bodyParser.json());

// Path to db.json
const dbFilePath = "./db.json";

// Read data from db.json
const readDB = () => {
  const data = fs.readFileSync(dbFilePath);
  return JSON.parse(data);
};

// Write data to db.json
const writeDB = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

// Get a product by ID
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const product = db.products.find((p) => p.id == id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Update a product by ID
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  const db = readDB();

  const productIndex = db.products.findIndex((p) => p.id == id);
  if (productIndex !== -1) {
    db.products[productIndex] = updatedProduct;
    writeDB(db);
    res.json({ message: "Product updated successfully", product: updatedProduct });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});