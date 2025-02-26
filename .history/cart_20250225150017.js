const express = require("express");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const CART_FILE = "./cart.json";
const JWT_SECRET = "your_secret_key"; // Change this in production

// *🔹 Load Cart*
app.get("/cart", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        fs.readFile(CART_FILE, "utf8", (err, data) => {
            if (err) return res.status(500).json({ error: "Error reading cart database" });

            let db = JSON.parse(data);
            let userCart = db.cart.find(cart => cart.userId === userId) || { cart: [] };

            res.json(userCart);
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// *🔹 Merge Cart After Login*
app.post("/cart/merge", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const { mergedCart } = req.body;

        fs.readFile(CART_FILE, "utf8", (err, data) => {
            if (err) return res.status(500).json({ error: "Error reading cart database" });

            let db = JSON.parse(data);
            let userCartIndex = db.cart.findIndex(cart => cart.userId === userId);

            if (userCartIndex >= 0) {
                db.cart[userCartIndex].cart = mergedCart;
            } else {
                db.cart.push({ userId, cart: mergedCart });
            }

            fs.writeFile(CART_FILE, JSON.stringify(db, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Error saving cart" });
                res.json({ message: "Cart merged successfully" });
            });
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// *🔹 Add to Cart*
app.post("/cart", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const { product } = req.body;

        fs.readFile(CART_FILE, "utf8", (err, data) => {
            if (err) return res.status(500).json({ error: "Error reading cart database" });

            let db = JSON.parse(data);
            let userCart = db.cart.find(cart => cart.userId === userId);

            if (userCart) {
                userCart.cart.push(product);
            } else {
                db.cart.push({ userId, cart: [product] });
            }

            fs.writeFile(CART_FILE, JSON.stringify(db, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Error saving cart" });
                res.json({ message: "Product added to cart" });
            });
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// *🔹 Start Server*
app.listen(3001, () => console.log("Server running on port 300"));