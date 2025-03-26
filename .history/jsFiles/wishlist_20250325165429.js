const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const router =express
const wishlistFilePath = "./jsonFiles/wishlist.json";

app.use(cors());
app.use(bodyParser.json());

// Middleware to check authentication token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  next();
};

// Read wishlist from file
const getWishlist = () => {
  const data = fs.readFileSync(wishlistFilePath);
  return JSON.parse(data).wishlist;
};

// Write updated wishlist to file
const saveWishlist = (wishlist) => {
  fs.writeFileSync(wishlistFilePath, JSON.stringify({ wishlist }, null, 2));
};

// *1. Fetch wishlist for a user*
router.get("/wishlist/:userId", authenticateToken, (req, res) => {
  const { userId } = req.params;
  const wishlist = getWishlist().find((w) => w.userId == userId);
  res.json(wishlist ? wishlist.cart : []);
});

// *2. Add item to wishlist*
router.post("/wishlist/add", authenticateToken, (req, res) => {
  const { userId, product } = req.body;
  let wishlist = getWishlist();
  let userWishlist = wishlist.find((w) => w.userId == userId);

  if (!userWishlist) {
    userWishlist = { userId, cart: [product] };
    wishlist.push(userWishlist);
  } else {
    if (!userWishlist.cart.find((item) => item.id === product.id)) {
      userWishlist.cart.push(product);
    }
  }

  saveWishlist(wishlist);
  res.json({ message: "Product added to wishlist", wishlist: userWishlist.cart });
});

// *3. Remove item from wishlist when added to cart*
router.post("/wishlist/remove", authenticateToken, (req, res) => {
  const { userId, productId } = req.body;
  let wishlist = getWishlist();
  let userWishlist = wishlist.find((w) => w.userId == userId);

  if (userWishlist) {
    userWishlist.cart = userWishlist.cart.filter((item) => item.id !== productId);
    saveWishlist(wishlist);
  }

  res.json({ message: "Product removed from wishlist", wishlist: userWishlist?.cart || [] });
});

module.exports = router