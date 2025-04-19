const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express(); // Ensure app is defined before usage
const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/public/profileImages", express.static("public/profileImages")); // Serve profile images

// Multer Configuration for Profile Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/profileImages";
    try {
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
      cb(null, uploadPath);
    } catch (error) {
      cb(new Error("Failed to create upload directory"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Prevent duplicate names
  },
});

const upload = multer({ storage });

// Read Users from File
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8"); // Specify encoding
    return JSON.parse(data).users;
  } catch (error) {
    console.error("Error reading users file:", error.message);
    return [];
  }
};

// Write Users to File
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error.message);
  }
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

app.use("/api", router); // Ensure router is mounted

module.exports = app; // Export app instead of router