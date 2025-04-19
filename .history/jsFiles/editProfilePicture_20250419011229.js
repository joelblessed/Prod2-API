const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";

// Serve profile images statically
router.use("/public/profileImage", express.static("public/profileImage"));

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("public", "profileImage");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, ${Date.now()}-${file.originalname});
  },
});
const upload = multer({ storage });

// Read users
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data).users;
  } catch (err) {
    return [];
  }
};

// Write users
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

// Update profile image
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  const users = readUsers();
  const index = users.findIndex(u => u.id === parseInt(userId));

  if (index === -1) return res.status(404).json({ message: "User not found" });
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Optional: Remove old image if stored in the same folder
  const oldImage = users[index].profileImage;
  if (oldImage && oldImage.startsWith("/public/profileImage")) {
    const oldImagePath = path.join(__dirname, "..", oldImage);
    if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
  }

  users[index].profileImage = /public/profileImage/${req.file.filename};
  writeUsers(users);

  res.json({ message: "Profile image updated", user: users[index] });
});

module.exports = router;