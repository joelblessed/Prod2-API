const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/public/images", express.static("images")); // Serve uploaded images

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/public/images"); // Save images in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original file name
  },
});

const upload = multer({ storage });

// Helper function to read users from file
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data).users;
  } catch (error) {
    return [];
  }
};

// Helper function to write users to file
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

// 🟢 *Fetch user profile by ID*
router.get("/profile", (req, res) => {
  const { userId } = req.query;
  const users = readUsers();
  const user = users.find((u) => u.id === parseInt(userId));

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// 🟡 *Update user profile*
router.put("/profile/update", (req, res) => {
  const { id, ...updatedFields } = req.body;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  users[userIndex] = { ...users[userIndex], ...updatedFields };
  writeUsers(users);

  res.json({ message: "Profile updated successfully", user: users[userIndex] });
});

// Update a product by ID
router.put('/updat-image/:id', upload.array('images'), (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const productIndex = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    const updatedProduct = { ...db.products[productIndex], ...JSON.parse(req.body.product) };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      updatedProduct.images = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    }

    db.products[productIndex] = updatedProduct;
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});
module.exports = router;