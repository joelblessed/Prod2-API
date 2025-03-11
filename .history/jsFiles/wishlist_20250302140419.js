
const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const router = express.Router();
require("dotenv").config();

const CART_DB = "./jsonFiles/wishlist.json";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Read wishlist data
const readCartDB = () => {
    try {
        const data = fs.readFileSync(CART_DB, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading wishlist database:", error);
        return { wishlists: [] }; // Default to empty if error occurs
    }
};

// Write wishlist data
const writeCartDB = (data) => {
    fs.writeFileSync(CART_DB, JSON.stringify(data, null, 2));
};

// Middleware: Verify Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// 1. Get User Cart
router.get("/wishlist", verifyToken, (req, res) => {
    const db = readCartDB();
    const userCart = db.wishlists.find(wishlist => wishlist.userId === req.userId)?.wishlist || [];
    res.json({ wishlist: userCart });
});

// 2. Add to Cart
router.post("/wishlist", verifyToken, (req, res) => {
    const { product } = req.body;
    if (!product) return res.status(400).json({ message: "Product is required" });

    let db = readCartDB();
    let userCart = db.wishlists.find(wishlist => wishlist.userId === req.userId)?.wishlist || [];

    // Prevent duplicate products
    if (!userCart.find(item => item.id === product.id)) {
        userCart.push(product);
    } else {
        return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Find user index
    const userIndex = db.wishlists.findIndex(wishlist => wishlist.userId === req.userId);

    if (userIndex !== -1) {
        db.wishlists[userIndex].wishlist = userCart;
    } else {
        db.wishlists.push({ userId: req.userId, wishlist: userCart });
    }

    writeCartDB(db);
    res.json({ message: "Product added to wishlist", wishlist: userCart });
});

// 3. Remove from Cart
router.delete("/wishlist/:productId", verifyToken, (req, res) => {
    const { productId } = req.params;
    let db = readCartDB();

    const userIndex = db.wishlists.findIndex(wishlist => wishlist.userId === req.userId);
    if (userIndex === -1) return res.status(404).json({ message: "User wishlist not found" });

    const updatedCart = db.wishlists[userIndex].wishlist.filter(item => item.id !== parseInt(productId));
    db.wishlists[userIndex].wishlist = updatedCart;
    writeCartDB(db);

    res.json({ message: "Product removed from wishlist", wishlist: updatedCart });
});

// 4. Merge Local Cart with Server Cart
router.post("/wishlist/merge", verifyToken, (req, res) => {
    const { localCart } = req.body;
    let db = readCartDB();
    
    const userIndex = db.wishlists.findIndex(wishlist => wishlist.userId === req.userId);
    let userCart = userIndex !== -1 ? db.wishlists[userIndex].wishlist : [];

    // Merge wishlists and remove duplicates
    const mergedCart = [...new Map([...localCart, ...userCart].map(item => [item.id, item])).values()];

    if (userIndex !== -1) {
        db.wishlists[userIndex].wishlist = mergedCart;
    } else {
        db.wishlists.push({ userId: req.userId, wishlist: mergedCart });
    }
    
    writeCartDB(db);
    res.json({ message: "Cart merged successfully", wishlist: mergedCart });
});

// 5. Clear Cart (Logout)
router.delete("/wishlist", verifyToken, (req, res) => {
    let db = readCartDB();
    db.wishlists = db.wishlists.filter(wishlist => wishlist.userId !== req.userId);
    writeCartDB(db);
    res.json({ message: "Cart cleared" });
});

module.exports = router;