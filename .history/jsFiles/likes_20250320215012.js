const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = "db.json";

// Read db.json
const readDB = () => JSON.parse(fs.readFileSync(dbPath));

// Write to db.json
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// *Like a product (Per User)*
app.patch("/products/:id/like", (req, res) => {
  const { userId } = req.body; // User ID from frontend
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const data = readDB();
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

  writeDB(data);
  res.json({ message: "Liked", likes: product.likes, likedBy: product.likedBy });
});

// *Dislike (remove like) for a specific user*
app.patch("/products/:id/dislike", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const data = readDB();
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

  writeDB(data);
  res.json({ message: "Disliked", likes: product.likes, likedBy: product.likedBy });
});

// *Start the server*
const PORT = 5000;
app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});