const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = 3001;
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
        return {};
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

// *1. Get User Cart*
app.get("/cart", verifyToken, (req, res) => {
    const db = readCartDB();
    const userCart = db[req.userId] || [];
    res.json({ cart: userCart });
});

// *2. Add to Cart*
app.post("/cart", verifyToken, (req, res) => {
    const { product } = req.body;
    if (!product) return res.status(400).json({ message: "Product is required" });

    let db = readCartDB();
    let userCart = db[req.userId] || [];

    // Prevent duplicate products
    if (!userCart.find(item => item.id === product.id)) {
        userCart.push(userId:re);
        db[req.userId] = userCart;
        writeCartDB(db);
    }

    res.json({ message: "Product added to cart", cart: userCart });
});

// *3. Remove from Cart*
app.delete("/cart/:productId", verifyToken, (req, res) => {
    const { productId } = req.params;
    let db = readCartDB();
    let userCart = db[req.userId] || [];

    userCart = userCart.filter(item => item.id !== productId);
    db[req.userId] = userCart;
    writeCartDB(db);

    res.json({ message: "Product removed from cart", cart: userCart });
});

// *4. Merge Local Cart with Server Cart*
app.post("/cart/merge", verifyToken, (req, res) => {
    const { localCart } = req.body;
    let db = readCartDB();
    let userCart = db[req.userId] || [];

    // Merge local cart and server cart (remove duplicates)
    const mergedCart = [...new Map([...localCart, ...userCart].map(item => [item.id, item])).values()];
    db[req.userId] = mergedCart;
    writeCartDB(db);

    res.json({ message: "Cart merged successfully", cart: mergedCart });
});

// *5. Clear Cart (Logout)*
app.delete("/cart", verifyToken, (req, res) => {
    let db = readCartDB();
    db[req.userId] = [];
    writeCartDB(db);
    res.json({ message: "Cart cleared" });
});

// *Start Server*
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
 });