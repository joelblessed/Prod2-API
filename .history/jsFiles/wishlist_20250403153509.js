const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const accountFilePath = path.join(__dirname, "../account.json");

// Read account.json data
const readAccountData = () => {
    try {
        const data = fs.readFileSync(accountFilePath);
        return JSON.parse(data);
    } catch (error) {
        return { wishlists: [] };
    }
};

// Write data to account.json
const writeAccountData = (data) => {
    fs.writeFileSync(accountFilePath, JSON.stringify(data, null, 2));
};

// *1. Add Product to Wishlist (Before & After Login)*
router.post("/add", (req, res) => {
    const { productId, userId } = req.body;
    const data = readAccountData();

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    if (userId) {
        // User is logged in: Find user's wishlist
        let userWishlist = data.wishlists.find((w) => w.userId === userId);
        if (!userWishlist) {
            userWishlist = { userId, products: [] };
            data.wishlists.push(userWishlist);
        }
        if (!userWishlist.products.includes(productId)) {
            userWishlist.products.push(productId);
        }
    } else {
        // Guest User: Store in session or temporary storage
        if (!data.wishlists.find((w) => w.userId === "guest")) {
            data.wishlists.push({ userId: "guest", products: [] });
        }
        const guestWishlist = data.wishlists.find((w) => w.userId === "guest");
        if (!guestWishlist.products.includes(productId)) {
            guestWishlist.products.push(productId);
        }
    }

    writeAccountData(data);
    res.json({ message: "Product added to wishlist successfully" });
});

// *2. Remove Product from Wishlist*
router.post("/remove", (req, res) => {
    const { productId, userId } = req.body;
    const data = readAccountData();

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const userWishlist = data.wishlists.find((w) => w.userId === (userId || "guest"));
    if (userWishlist) {
        userWishlist.products = userWishlist.products.filter((id) => id !== productId);
    }

    writeAccountData(data);
    res.json({ message: "Product removed from wishlist successfully" });
});

// *3. Get Wishlist for User*
router.get("/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readAccountData();

    const userWishlist = data.wishlists.find((w) => w.userId === userId) || { userId, products: [] };
    res.json(userWishlist.products);
});

module.exports = router;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch Wishlist from API
export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (userId) => {
    const response = await fetch(http://localhost:5000/wishlist/${userId});
    return response.json();
});

// Add to Wishlist
export const addToWishlist = createAsyncThunk("wishlist/add", async ({ productId, userId }) => {
    await fetch("http://localhost:5000/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId }),
    });
    return productId;
});

// Remove from Wishlist
export const removeFromWishlist = createAsyncThunk("wishlist/remove", async ({ productId, userId }) => {
    await f…
import React from "react";
import { useDispatch } from "react-redux";
import { addToWishlist } from "../redux/wishlistSlice";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const userId = localStorage.getItem("userId") || "guest"; // Check user login

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => dispatch(addToWishlist({ productId: product.id, userId }))}>
                Add to Wishlist
            </button>
        </div>
    );
};

export default ProductCard;