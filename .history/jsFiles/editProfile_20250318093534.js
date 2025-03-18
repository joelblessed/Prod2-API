const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public"))); // Serve static files from /public

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/profileImages")); // Save images in /public/profileImages
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Load account data from account.json
let accountData = { users: [] };
const accountFilePath = path.join(__dirname, "account.json");

if (fs.existsSync(accountFilePath)) {
  accountData = JSON.parse(fs.readFileSync(accountFilePath, "utf-8"));
}

// Save account data to account.json
const saveAccountData = () => {
  fs.writeFileSync(accountFilePath, JSON.stringify(accountData, null, 2));
};

// Routes

// 🔹 Get user profile
router.get("/profile", (req, res) => {
  const { userId } = req.query;
  const user = accountData.users.find((u) => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 🔹 Update user profile (excluding image)
router.put("/profile/update", (req, res) => {
  const { id, ...updatedData } = req.body;
  const userIndex = accountData.users.findIndex((u) => u.id === id);

  if (userIndex !== -1) {
    accountData.users[userIndex] = { ...accountData.users[userIndex], ...updatedData };
    saveAccountData();
    res.json({ message: "Profile updated successfully", user: accountData.users[userIndex] });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 🔹 Update user profile image
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  const userIndex = accountData.users.findIndex((u) => u.id === userId);

  if (userIndex !== -1) {
    if (req.file) {
      const profileImage = `/public/profileImages/${req.file.filename}; // Image URL
      accountData.users[userIndex].profileImage = profileImage;
      saveAccountData();
      res.json({ message: "Profile image updated successfully", user: accountData.users[userIndex] });
    } else {
      res.status(400).json({ error: "No file uploaded" });
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

module.exports = router;