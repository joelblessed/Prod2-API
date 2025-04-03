const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const router = express.Router();


app.use(express.json());
app.use(cors());

const ACCOUNT_FILE = "./account.json";

// Read accounts from JSON
const readAccounts = () => {
  return JSON.parse(fs.readFileSync(ACCOUNT_FILE, "utf-8"));
};

// Save accounts to JSON
const saveAccounts = (data) => {
  fs.writeFileSync(ACCOUNT_FILE, JSON.stringify(data, null, 2));
};

// Add product ID to wishlist
app.post("/wishlist/add", (req, res) => {
  const { productId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const accounts = readAccounts();
  const user = accounts.find((u) => u.token === token);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.wishlist) {
    user.wishlist = [];
  }

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
  }

  saveAccounts(accounts);
  res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
});

// Remove product ID from wishlist
app.post("/wishlist/remove", (req, res) => {
  const { productId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const accounts = readAccounts();
  const user = accounts.find((u) => u.token === token);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.wishlist = user.wishlist.filter((id) => id !== productId);
  saveAccounts(accounts);
  res.json({ message: "Product removed from wishlist", wishlist: user.wishlist });
});

// Get wishlist
app.get("/wishlist", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const accounts = readAccounts();
  const user = accounts.find((u) => u.token === token);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ wishlist: user.wishlist || [] });
});

module.exports =router;