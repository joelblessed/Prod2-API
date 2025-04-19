const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";

// Serve static images
router.use("/public/profileImages", express.static("public/profileImages"));

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("public", "profileImages");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname});
  },
});
const upload = multer({ storage });

// Read users from JSON file
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data).users;
  } catch (error) {
    return [];
  }
};

// Write users to JSON file
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

// PUT /profile/update-image/:userId
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  const users = readUsers();
  const userIndex = users.findIndex(user => user.id === parseInt(userId));

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imagePath = `/public/profileImages/${req.file.filename}`;
  const oldImage = users[userIndex].profileImage;

  // Optionally delete old image
  if (oldImage && oldImage.startsWith("/public/profileImages")) {
    const oldPath = path.join(__dirname, "..", oldImage);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  users[userIndex].profileImage = imagePath;
  writeUsers(users);

  res.json({ message: "Profile image updated", user: users[userIndex] });
});

module.exports = router;