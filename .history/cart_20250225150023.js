const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const CART_FILE_PATH = path.join(__dirname, "cart.json");

app.use(bodyParser.json());

// *Get Cart*
app.get("/cart", (req, res) => {
    fs.readFile(CART_FILE_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading cart file.");
        res.json(JSON.parse(data));
    });
});

// *Add Product to Cart*
app.post("/cart", (req, res) => {
    const product = req.body.product;

    fs.readFile(CART_FILE_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading cart file.");
        let cart = JSON.parse(data).cart;
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        fs.writeFile(CART_FILE_PATH, JSON.stringify({ cart }), (err) => {
            if (err) return res.status(500).send("Error saving cart data.");
            res.status(201).send("Product added to cart.");
        });
    });
});

// *Update Product Quantity*
app.put("/cart/:productId", (req, res) => {
    const { productId } = req.params;
    const updatedCart = req.body.cart;

    fs.writeFile(CART_FILE_PATH, JSON.stringify({ cart: updatedCart }), (err) => {
        if (err) return res.status(500).send("Error updating cart.");
        res.status(200).send("Cart updated.");
    });
});

// *Remove Product from Cart*
app.delete("/cart/:productId", (req, res) => {
    const { productId } = req.params;

    fs.readFile(CART_FILE_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading cart file.");
        let cart = JSON.parse(data).cart;
        cart = cart.filter(item => item.id !== parseInt(productId));
        fs.writeFile(CART_FILE_PATH, JSON.stringify({ cart }), (err) => {
            if (err) return res.status(500).send("Error saving cart.");
            res.status(200).send("Product removed from cart.");
        });
    });
});

// *Clear Cart*
app.delete("/cart", (req, res) => {
    fs.writeFile(CART_FILE_PATH, JSON.stringify({ cart: [] }), (err) => {
        if (err) return res.status(500).send("Error clearing cart.");
        res.status(200).send("Cart cleared.");
    });
});

app.listen(PORT, () => {
    console.log(Server is running on http://localhost:${PORT});
});