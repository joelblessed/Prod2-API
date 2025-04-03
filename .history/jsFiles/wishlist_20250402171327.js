const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = express.Router();

dotenv.config();
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET 

// Helper functions to read and write users from/to account.json
const getUsers = () => JSON.parse(fs.readFileSync("./jsonFiles/account.json", "utf8")).users;
const saveUsers = (users) =>
  fs.writeFileSync("account.json", JSON.stringify({ users }, null, 2));

// JWT middleware to verify token and attach user info to request
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    // Remove the "Bearer " prefix if present
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded; // { userId, email, ... }
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Endpoint to add a product to the user's wishlist
router.post("/wishlist/add", verifyToken, (req, res) => {
  const { product } = req.body; // product should include at least an "id" property
  const { userId } = req.user; // Extracted from token

  let users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Ensure wishlist exists
  if (!user.wishlist) {
    user.wishlist = [];
  }

  // Prevent duplicate products in the wishlist
  if (user.wishlist.find((p) => p.id === product.id)) {
    return res.status(400).json({ message: "Product already in wishlist." });
  }

  user.wishlist.push(product);
  saveUsers(users);

  res.json({
    message: "Product added to wishlist.",
    wishlist: user.wishlist,
  });
});

// (Optional) Endpoint to remove a product from the wishlist
app.post("/wishlist/remove", verifyToken, (req, res) => {
  const { productId } = req.body;
  const { userId } = req.user;

  let users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.wishlist = user.wishlist.filter((p) => p.id !== productId);
  saveUsers(users);

  res.json({
    message: "Product removed from wishlist.",
    wishlist: user.wishlist,
  });
});

module.exports= router;