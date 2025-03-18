const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { router } = require("json-server");

const app = express();
const PORT = 5000;

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
let accountData = [];
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
app.get("/profile", (req, res) => {
  const { userId } = req.query;
  const user = accountData.find((u) => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 🔹 Update user profile (excluding image)
app.put("/profile/update", (req, res) => {
  const { id, ...updatedData } = req.body;
  const userIndex = accountData.findIndex((u) => u.id === id);

  if (userIndex !== -1) {
    accountData[userIndex] = { ...accountData[userIndex], ...updatedData };
    saveAccountData();
    res.json({ message: "Profile updated successfully", user: accountData[userIndex] });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// 🔹 Update user profile image
app.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  const userIndex = accountData.findIndex((u) => u.id === userId);

  if (userIndex !== -1) {
    const profileImage = req.file ? /uploads/${req.file.filename} : null;
    if (profileImage) {
      accountData[userIndex].profileImage = profileImage;
      saveAccountData();
      res.json({ message: "Profile image updated successfully", user: accountData[userIndex] });
    } else {
      res.status(400).json({ error: "No file uploaded" });
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

module. exports = router