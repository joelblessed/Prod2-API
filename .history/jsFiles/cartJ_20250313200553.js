const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const bodyParser = require("body-parser");
const { route } = require("./cart");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const CART_FILE = "cart.json";

// Helper function to read cart data
const readCartData = async () => {
    try {
        const data = await fs.readFile(CART_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading cart data:", error);
        return { cart: [] };
    }
};

// Helper function to write cart data
const writeCartData = async (data) => {
    try {
        await fs.writeFile(CART_FILE, JSON.stringify(data, null, 2));
        return { message: "Cart updated successfully" };
    } catch (error) {
        console.error("Error writing cart data:", error);
        return { message: "Error updating cart", error };
    }
};

// Middleware for authentication (dummy check)
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

// 🟢 Increment Product Quantity
app.put("/cart/:productId/increment", authenticate, async (req, res) => {
    const { productId } = req.params;
    let data = await readCartData();

    const productIndex = data.cart.findIndex((item) => item.productId === productId);
    if (productIndex !== -1) {
        data.cart[productIndex].quantity += 1;
    } else {
        data.cart.push({ productId, quantity: 1 });
    }

    const result = await writeCartData(data);
    res.json({ message: "Product quantity increased", cart: data.cart });
});

// 🔻 Decrement Product Quantity
app.put("/cart/:productId/decrement", authenticate, async (req, res) => {
    const { productId } = req.params;
    let data = await readCartData();

    const productIndex = data.cart.findIndex((item) => item.productId === productId);
    if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found in cart" });
    }

    if (data.cart[productIndex].quantity > 1) {
        data.cart[productIndex].quantity -= 1;
    } else {
        data.cart.splice(productIndex, 1); // Remove product if quantity is 0
    }

    const result = await writeCartData(data);
    res.json({ message: "Product quantity decreased", cart: data.cart });
});

// 🛒 Get Cart Items
app.get("/cart", authenticate, async (req, res) => {
    const data = await readCartData();
    res.json(data);
});

module.exports = route