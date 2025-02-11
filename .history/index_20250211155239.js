
const express = require("express");
const app = express();

const ordersRoutes = require("./orders");
const productsRoutes = require("./db")
const cartRoutes = require("./cart");
const wishlistRoutes = require("./wishlist");
const signUpRoutes = require("./signUp");
const signInRoutes = require("./signIn");
const formUploadRoutes = require("./formUpload");
const passwardResetRoutes = require("./passwardReset");
const paymentRoutes = require("./payment");


app.use("/", ordersRoutes);
app.use("/", productsRoutes);
app.use("/", cartRoutes);
app.use("/", wishlistRoutes);
app.use("/", signUpRoutes);
app.use("/", signInRoutes);
app.use("/", formUploadRoutes);
app.use("/", passwardResetRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
