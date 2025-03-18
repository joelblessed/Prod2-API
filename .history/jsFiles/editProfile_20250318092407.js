const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Load account data from account.json
let user = [];
const accountFilePath = path.join(__dirname, "../jsonFiles/account.json");

if (fs.existsSync(accountFilePath)) {
  user = JSON.parse(fs.readFileSync(accountFilePath, "utf-8"));
}

// Save account data to account.json
const saveAccountData = () => {
  fs.writeFileSync(accountFilePath, JSON.stringify(user, null, 2));
};

// Routes

// 🔹 Get user profile
router.get("/profile", (req, res) => {
  const { userId } = req.query;
  const user = user.find((u) => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 🔹 Update user profile (excluding image)
router.put("/profile/update", (req, res) => {
  const { id, ...updatedData } = req.body;
  const userIndex = user.findIndex((u) => u.id === id);

  if (userIndex !== -1) {
    user[userIndex] = { ...user[userIndex], ...updatedData };
    saveAccountData();
    res.json({ message: "Profile updated successfully", user: user[userIndex] });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 🔹 Update user profile image
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  const userIndex = user.findIndex((u) => u.id === userId);

  if (userIndex !== -1) {
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
    if (profileImage) {
      user[userIndex].profileImage = profileImage;
      saveAccountData();
      res.json({ message: "Profile image updated successfully", user: user[userIndex] });
    } else {
      res.status(400).json({ error: "No file uploaded" });
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

module. exports = router;