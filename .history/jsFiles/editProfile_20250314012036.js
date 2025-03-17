const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const router = express.Router();

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/public/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync("/publicimages")) {
  fs.mkdirSync("uploads");
}

// Mock user data
let users = [
  {
    id: "1",
    email: "user@example.com",
    userName: "user123",
    fullName: "John Doe",
    phone: "1234567890",
    address: "123 Main St",
    profileImage: "",
  },
];

// Route to get user profile
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = users.find((u) => u.id === "1"); // Mock user ID
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// Route to update user profile
app.put("/updateProfile/:id", upload.single("profileImage"), (req, res) => {
  const userId = req.params.id;
  const { userName, fullName, email, phone, address } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename} `: "";

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.userName = userName;
  user.fullName = fullName;
  user.email = email;
  user.phone = phone;
  user.address = address;
  if (profileImage) {
    user.profileImage = profileImage;
  }

  res.json({ message: "Profile updated successfully", user });
});

// Serve uploaded files statically
app.use("/images", express.static(path.join(__dirname, "./public/images")));

module.exports = router;