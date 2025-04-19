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
router.use("/public/profileImages", express.static("public/profileImages"));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("public", "profileImages");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, ${Date.now()}-${file.originalname});
  },
});

const upload = multer({ storage });

// Helpers
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data).users;
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

// Route: Update profileImage and Discount
router.put("/profile/update/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  const { Discount } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex((u) => u.id === parseInt(userId));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  // Update Discount if provided
  if (Discount !== undefined) {
    users[userIndex].Discount = parseFloat(Discount);
  }

  // Update profileImage if uploaded
  if (req.file) {
    const imageUrl = `/public/profileImages/${req.file.filename``};

    // Optional: Delete old image if needed
    const oldImage = users[userIndex].profileImage;
    if (oldImage && oldImage.startsWith("/public/profileImages")) {
      const oldImagePath = path.join(__dirname, "..", oldImage);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    users[userIndex].profileImage = imageUrl;
  }

  writeUsers(users);
  res.json({ message: "Profile and Discount updated", user: users[userIndex] });
});

module.exports = router;