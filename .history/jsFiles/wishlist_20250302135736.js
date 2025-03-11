
const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const router = express.Router();
require("dotenv").config();

const WishList_DB = "./jsonFiles/wishlists.json";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Read cart data
const readwishlistDB = () => {
    try {
        const data = fs.readFileSync(WishList_DB, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading cart database:", error);
        return { wishlists: [] }; // Default to empty if error occurs
    }
};

// Write cart data
const writewishlistDB = (data) => {
    fs.writeFileSync(WishList_DB, JSON.stringify(data, null, 2));
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
    const db = readwishlistDB();
    const userCart = db.wishlists.find(cart => cart.userId === req.userId)?.cart || [];
    res.json({ cart: userCart });
});

// 2. Add to Cart
router.post("/wishlist", verifyToken, (req, res) => {
    const { product } = req.body;
    if (!product) return res.status(400).json({ message: "Product is required" });

    let db = readwishlistDB();
    let userCart = db.wishlists.find(cart => cart.userId === req.userId)?.cart || [];

    // Prevent duplicate products
    if (!userCart.find(item => item.id === product.id)) {
        userCart.push(product);
    } else {
        return res.status(400).json({ message: "Product already in cart" });
    }

    // Find user index
    const userIndex = db.wishlists.findIndex(cart => cart.userId === req.userId);

    if (userIndex !== -1) {
        db.wishlists[userIndex].cart = userCart;
    } else {
        db.wishlists.push({ userId: req.userId, cart: userCart });
    }

    writewishlistDB(db);
    res.json({ message: "Product added to cart", cart: userCart });
});

// 3. Remove from Cart
router.delete("/wishlist/:productId", verifyToken, (req, res) => {
    const { productId } = req.params;
    let db = readwishlistDB();

    const userIndex = db.wishlists.findIndex(cart => cart.userId === req.userId);
    if (userIndex === -1) return res.status(404).json({ message: "User cart not found" });

    const updatedCart = db.wishlists[userIndex].cart.filter(item => item.id !== parseInt(productId));
    db.wishlists[userIndex].cart = updatedCart;
    writewishlistDB(db);

    res.json({ message: "Product removed from cart", cart: updatedCart });
});

// 4. Merge Local Cart with Server Cart
router.post("/wishlist/merge", verifyToken, (req, res) => {
    const { localCart } = req.body;
    let db = readwishlistDB();
    
    const userIndex = db.wishlists.findIndex(cart => cart.userId === req.userId);
    let userCart = userIndex !== -1 ? db.wishlists[userIndex].cart : [];

    // Merge wishlists and remove duplicates
    const mergedCart = [...new Map([...localCart, ...userCart].map(item => [item.id, item])).values()];

    if (userIndex !== -1) {
        db.wishlists[userIndex].cart = mergedCart;
    } else {
        db.wishlists.push({ userId: req.userId, cart: mergedCart });
    }
    
    writewishlistDB(db);
    res.json({ message: "Cart merged successfully", cart: mergedCart });
});

// 5. Clear Cart (Logout)
router.delete("/wishlist", verifyToken, (req, res) => {
    let db = readwishlistDB();
    db.wishlists = db.wishlists.filter(cart => cart.userId !== req.userId);
    writewishlistDB(db);
    res.json({ message: "Cart cleared" });
});

module.exports = router;