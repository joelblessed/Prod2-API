const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 5000;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Path to the account.json file
const accountFilePath = path.join(__dirname, "account.json");

// Helper function to read user data from account.json
const readUsers = () => {
  if (!fs.existsSync(accountFilePath)) {
    // Create file with the correct structure if it doesn't exist
    fs.writeFileSync(accountFilePath, JSON.stringify({ users: [] }));
  }
  const data = fs.readFileSync(accountFilePath, "utf-8");
  return JSON.parse(data).users; // Return the users array
};

// Helper function to write user data to account.json
const writeUsers = (users) => {
  const data = { users }; // Wrap the users array in an object
  fs.writeFileSync(accountFilePath, JSON.stringify(data, null, 2));
};

// Route to get user profile
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const users = readUsers();
  const user = users.find((u) => u.id === "1"); // Mock user ID
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// Route to update user profile
app.put("/updateProfile/:id", upload.single("profileImage"), (req, res) => {
  const userId = req.params.id;
  const { userName, fullName, email, phone, address } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename} `: "";

  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.userName = userName;
  user.fullName = fullName;
  user.email = email;
  user.phone = phone;
  user.address = address;
  if (profileImage) {
    user.profileImage = profileImage;
  }

  writeUsers(users); // Save updated user data to account.json

  res.json({ message: "Profile updated successfully", user });
});

// Serve uploaded files statically
app.use("/images", express.static(path.join(__dirname, "")));

