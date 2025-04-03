const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = express.Router();

dotenv.config();
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "mystrongsecretkey";

// Helper functions to read and write users from/to account.json
const getUsers = () => JSON.parse(fs.readFileSync("./jsonFiles/account.json", "utf8")).users;
const saveUsers = (users) =>
  fs.writeFileSync("./jsonFiles/account.json", JSON.stringify({ users }, null, 2));


// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};



// (Optional) Endpoint to remove a product from the wishlist
router.post("/wishlist/remove", verifyToken, (req, res) => {
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