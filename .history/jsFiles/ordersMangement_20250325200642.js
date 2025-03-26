const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router()
const ordersFilePath = "./jsonFiles/orders.json";

app.use(cors());
app.use(bodyParser.json());

// Middleware to check authentication token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  next();
};

// Read orders from file
const getOrders = () => {
  const data = fs.readFileSync(ordersFilePath);
  return JSON.parse(data).orders;
};

// Write updated orders to file
const saveOrders = (orders) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify({ orders }, null, 2));
};

// *1. Fetch all orders (Requires Token)*
router.get("/orders", authenticateToken, (req, res) => {
  res.json(getOrders());
});

// *2. Fetch orders by userId (Requires Token)*
router.get("/orders/:userId", authenticateToken, (req, res) => {
  const { userId } = req.params;
  const orders = getOrders().filter((order) => order.user.userId == userId);
  res.json(orders);
});

// *3. Cancel an Order (Requires Token)*
router.patch("/orders/cancel/:orderId", authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id == orderId);

  if (orderIndex === -1) return res.status(404).json({ message: "Order not found" });

  orders[orderIndex].status = "Canceled";
  saveOrders(orders);
  res.json({ message: "Order canceled successfully" });
});

// *4. Mark an Order as Delivered and Store Delivery Date*
router.patch("/orders/deliver/:orderId", authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const deliveryDate = new Date().toISOString();
  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id == orderId);

  if (orderIndex === -1) return res.status(404).json({ message: "Order not found" });

  orders[orderIndex].status = "Delivered";
  orders[orderIndex].shipping.deliveryDate = deliveryDate;
  saveOrders(orders);
  res.json({ message: "Order delivered successfully", deliveryDate });
});




// 📌 Helper function to read JSON file
const readData = (file) => {
    try {
      return JSON.parse(fs.readFileSync(file));
    } catch (err) {
      return { cart: [], wishlist: [] };
    }
  };
  
  // 📌 Helper function to write JSON file
  const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };
  
  // ✅ Add to Cart and Remove from Wishlist
  router.post("/cart/add", (req, res) => {
    const { userId, product } = req.body;
    const cartData = readData(CART_FILE);
    const wishlistData = readData(WISHLIST_FILE);
  
    // Check if product already exists in cart
    if (cartData.carts.some((item) => item.id === product.id)) {
      return res.status(400).json({ message: "Product already in cart" });
    }
  
    // Add to cart
    cartData.cart.push(product);
    writeData(CART_FILE, cartData);
  
    // Remove from wishlist
    wishlistData.wishlist = wishlistData.wishlist.map((user) => {
      if (user.userId === userId) {
        user.cart = user.cart.filter((item) => item.id !== product.id);
      }
      return user;
    });
  
    writeData(WISHLIST_FILE, wishlistData);
  
    res.json({ message: "Added to cart and removed from wishlist" });
  });
  
  // ✅ Get Cart by User ID
  router.get("/cart/:userId", (req, res) => {
    const { userId } = req.params;
    const cartData = readData(CART_FILE);
    const userCart = cartData.cart.filter((item) => item.ownerId == userId);
    res.json(userCart);
  });

// *Start Server*
module.exports = router;