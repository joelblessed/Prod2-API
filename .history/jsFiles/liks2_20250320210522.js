const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = "db.json";

// Read db.json
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));

// Write to db.json
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// *Like a product*
app.patch("/products/:id/like", (req, res) => {
  const data = readDB();
  const productIndex = data.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  data.products[productIndex].likes += 1;
  data.products[productIndex].liked = true; // Mark as liked
  writeDB(data);

  res.json({ message: "Liked", likes: data.products[productIndex].likes, liked: true });
});

// *Dislike (remove like)*
app.patch("/products/:id/dislike", (req, res) => {
  const data = readDB();
  const productIndex = data.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Prevent negative likes
  if (data.products[productIndex].likes > 0) {
    data.products[productIndex].likes -= 1;
  }
  
  data.products[productIndex].liked = false; // Mark as not liked
  writeDB(data);
  
  res.json({ message: "Disliked", likes: data.products[productIndex].likes, liked: false });
});

// *Start the server*
const PORT = 5000;
app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});