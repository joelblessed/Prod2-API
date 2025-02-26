const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

const CART_DB = "./cart.json";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

app.use(cors());
app.use(bodyParser.json());

// Read cart data
const readCartDB = () => {
    try {
        const data = fs.readFileSync(CART_DB, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading cart database:", error);
        return { carts: [] };  // Default to an empty array if there's an error
    }
};

// Write cart data
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
app.get("/cart", verifyToken, (req, res) => {
    const db = readCartDB();
    const userCart = db.carts.find(cart => cart.userId === req.userId)?.cart || [];
    res.json({ cart: userCart });
});

// 2. Add to Cart
app.post("/cart", verifyToken, (req, res) => {
    const { product } = req.body;
    if (!product) return res.status(400).json({ message: "Product is required" });

    let db = readCartDB();
    let userCart = db.carts.find(cart => cart.userId === req.userId)?.cart || [];

    // Prevent duplicate products
    if (!userCart.find(item => item.id === product.id)) {
        userCart.push(product);
    } else {
        return res.status(400).json({ message: "Product already in cart" });
    }

    // Find the user in the carts array
    const userIndex = db.carts.findIndex(cart => cart.userId === req.userId);

    if (userIndex !== -1) {
        // Update existing user's cart
        db.carts[userIndex].cart = userCart;
    } else {
        // Add new user and their cart if not found
        db.carts.push({ userId: req.userId, cart: userCart });
    }

    writeCartDB(db);
    res.json({ message: "Product added to cart", cart: userCart });
});

// 3. Remove from Cart
app.delete("/cart/:productId", verifyToken, (req, res) => {
    const { productId } = req.params;
    let db = readCartDB();

    const userIndex = db.carts.findIndex(cart => cart.userId === req.userId);
    if (userIndex === -1) return res.status(404).json({ message: "User cart not found" });

    const userCart = db.carts[userIndex].cart;
    const updatedCart = userCart.filter(item => item.id !== parseInt(productId));

    // Update the user's cart
    db.carts[userIndex].cart = updatedCart;
    writeCartDB(db);

    res.json({ message: "Product removed from cart", cart: updatedCart });
});

// 4. Merge Local Cart with Server Cart
app.post("/cart/merge", verifyToken, (req, res) => {
    const { localCart } = req.body;
    let db = readCartDB();
    
    const userIndex = db.carts.findIndex(cart => cart.userId === req.userId);
    let userCart = userIndex !== -1 ? db.carts[userIndex].cart : [];

    // Merge local cart with server cart (remove duplicates)
    const mergedCart = [...new Map([...localCart, ...userCart].map(item => [item.id, item])).values()];

    // Update or create cart for the user
    if (userIndex !== -1) {
        db.carts[userIndex].cart = mergedCart;
    } else {
        db.carts.push({ userId: req.userId, cart: mergedCart });
    }
    
    writeCartDB(db);

    res.json({ message: "Cart merged successfully", cart: mergedCart });
});

// 5. Clear Cart (Logout)
app.delete("/cart", verifyToken, (req, res) => {
    let db = readCartDB();

    // Clear the user's cart
    db.carts = db.carts.filter(cart => cart.userId !== req.userId);
    writeCartDB(db);

    res.json({ message: "Cart cleared" });
});

module.exports = router