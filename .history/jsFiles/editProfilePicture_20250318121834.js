const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";

// Middleware
router.use(cors());
router.use(bodyParser.json());
router.use("/public/profileImages", express.static(__dirname.join,"public","profileImages")); // Serve profile images

// Multer Configuration for Profile Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/profileImages"; 
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Prevent duplicate names
  },
});

const upload = multer({ storage });

// Read Users from File
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data).users;
  } catch (error) {
    return [];
  }
};

// Write Users to File
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

// 🟠 *Upload and Update Profile Picture*
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(userId));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Save the correct image path
  const imageUrl = `/public/profileImages/${req.file.filename}`;
  users[userIndex].profileImage = imageUrl;

  writeUsers(users);

  res.json({ message: "Profile image updated", user: users[userIndex] });
});

module.exports = router;