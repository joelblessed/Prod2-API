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
app.use("public/profileImages", express.static("profileImages")); // Serve uploaded images

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profileImages"); // Save images in "uploads" folder
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

// 🟠 *Upload profile image*
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(userId));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  users[userIndex].profileImage = `/profileImages/${req.file.filename}`;
  writeUsers(users);

  res.json({ message: "Profile image updated", user: users[userIndex] });
});
module.exports = router;