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
router.post("/addToWish", (req, res) => {
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
router.post("/removeFromWishlist", (req, res) => {
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
router.get("/wishlist/:userId", (req, res) => {
    const { userId } = req.params;
    const data = readAccountData();

    const userWishlist = data.wishlists.find((w) => w.userId === userId) || { userId, products: [] };
    res.json(userWishlist.products);
});

module.exports = router;
