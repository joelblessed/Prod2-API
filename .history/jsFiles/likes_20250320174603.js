const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = "db.json";

// Function to read data from db.json
const readDB = () => {
  return JSON.parse(fs.readFileSync(DB_FILE));
};

// Function to write data to db.json
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// *Get all products*
app.get("/products", (req, res) => {
  const data = readDB();
  res.json(data.products);
});

// *Get single product by ID*
app.get("/products/:id", (req, res) => {
  const data = readDB();
  const product = data.products.find(p => p.id === parseInt(req.params.id));
  
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// *Increment likes for a product*
app.patch("/products/:id/like", (req, res) => {
  const data = readDB();
  const productIndex = data.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  data.products[productIndex].likes += 1;
  writeDB(data);

  res.json({ message: "Likes updated", likes: data.products[productIndex].likes });
});

module