const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const bodyParser = require("body-parser");

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
        return { carts: [] };
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

// Middleware to authenticate user (Dummy check)
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

// 🟢 Increment Product Quantity
app.put("/cart/:userId/:productId/increment", authenticate, async (req, res) => {
    const { userId, productId } = req.params;
    let data = await readCartData();

    const userCart = data.carts.find((cart) => cart.userId === parseInt(userId));
    if (!userCart) return res.status(404).json({ message: "User not found" });

    const product = userCart.cart.find((item) => item.id === parseInt(productId));
    if (!product) return res.status(404).json({ message: "Product not found in cart" });

    if (product.quantity < product.numberInStock) {
        product.quantity += 1;
        const result = await writeCartData(data);
        return res.json({ message: "Product quantity increased", cart: userCart.cart });
    }

    res.status(400).json({ message: "Cannot exceed stock limit" });
});

// 🔻 Decrement Product Quantity
app.put("/cart/:userId/:productId/decrement", authenticate, async (req, res) => {
    const { userId, productId } = req.params;
    let data = await readCartData();

    const userCart = data.carts.find((cart) => cart.userId === parseInt(userId));
    if (!userCart) return res.status(404).json({ message: "User not found" });

    const productIndex = userCart.cart.findIndex((item) => item.id === parseInt(productId));
    if (productIndex === -1) return res.status(404).json({ message: "Product not found in cart" });

    const product = userCart.cart[productIndex];

    if (product.quantity > 1) {
        product.quantity -= 1;
    } else {
        userCart.cart.splice(productIndex, 1); // Remove item if quantity is 0
    }

    const result = await writeCartData(data);
    res.json({ message: "Product quantity decreased", cart: userCart.cart });
});

// 🛒 Get User's Cart
app.get("/cart/:userId", authenticate, async (req, res) => {
    const { userId } = req.params;
    const data = await readCartData();

    const userCart = data.carts.find((cart) => cart.userId === parseInt(userId));
    if (!userCart) return res.status(404).json({ message: "User not found" });

    res.json(userCart.cart);
});

mo