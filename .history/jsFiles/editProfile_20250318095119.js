const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";

// Ensure the "public/images" directory exists
const uploadDir = path.join(__dirname, "public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/public/images", express.static(uploadDir)); // Serve uploaded images

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save images in "public/images" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Helper function to read users from file
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data).users;
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

// Helper function to write users to file
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
};

// 🟢 Fetch user profile by ID
router.get("/profile", (req, res) => {
  const { userId } = req.query;
  const users = readUsers();
  const user = users.find((u) => u.id === parseInt(userId));

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// 🟡 Update user profile
router.put("/profile/update", (req, res) => {
  const { id, ...updatedFields } = req.body;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  users[userIndex] = { ...users[userIndex], ...updatedFields };
  writeUsers(users);

  res.json({ message: "Profile updated successfully", user: users[userIndex] });
});

// 🟠 Upload profile image
router.put("/profile/update-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(userId));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Save the full image URL
  const imageUrl = `http://localhost:5000/public/images/${req.file.filename};
  users[userIndex]`.profileImage = imageUrl;
  writeUsers(users);

  res.json({ message: "Profile image updated", user: users[userIndex] });
});

module.exports = router;