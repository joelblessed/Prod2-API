const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const router = express.Router();
const USERS_FILE = "./jsonFiles/account.json";


// Middleware
app.use(cors());
app.use(express.json());
app.use("/public/images", express.static(path.join(__dirname, "public/images"))); // Serve uploaded images

// 🟢 *Multer Configuration for Image Uploads*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public/images");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original filename
  },
});

const upload = multer({ storage });

// 🟢 *Helper Functions to Read & Write Users*
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data).users;
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

// 🟢 *Fetch User Profile by ID*
router.get("/profile", (req, res) => {
  const { userId } = req.query;
  const users = readUsers();
  const user = users.find((u) => u.id === parseInt(userId));

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// 🟡 *Update User Profile (Text Fields)*
router.put("/profile/update", (req, res) => {
  const { id, ...updatedFields } = req.body;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  users[userIndex] = { ...users[userIndex], ...updatedFields };
  writeUsers(users);

  res.json({ message: "Profile updated successfully", user: users[userIndex] });
});

router.put("/profile-image/:userId", upload.single("profileImage"), (req, res) => {
  const { userId } = req.params;
  let users = readUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(userId));

  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Store the correct public image path
  const imageUrl = `/public/images/${req.file.originalname}`;
  users[userIndex].profileImage = imageUrl;
  
  writeUsers(users);

  res.json({ message: "Profile image updated", user: users[userIndex] });
});
module.exports = router;  