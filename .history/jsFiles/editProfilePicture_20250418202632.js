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
router.use("/public/profileImages", express.static(path.join(__dirname, "public/profileImages")));

// Multer Configuration with Validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public/profileImages");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, ${Date.now()}-${sanitizedFileName});
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data).users;
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
    throw error;
  }
};

// 🟠 Upload and Update Profile Picture
router.put(
  "/profile/update-image/:userId",
  upload.single("profileImage"),
  (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate userId
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid user ID" 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "No file uploaded or invalid file type" 
        });
      }

      const users = readUsers();
      const userIndex = users.findIndex((user) => user.id === parseInt(userId));

      if (userIndex === -1) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Construct URL path
      const imageUrl = `/public/profileImages/${req.file.filename};
      
      // Update user data
      const updatedUser = {
        ...users[userIndex],
        profileImage: imageUrl
      };
      
      users[userIndex] = updatedUser;
      writeUsers(users);

      res.json({ 
        success: true,
        message: "Profile image updated successfully",
        data: {
          user: updatedUser,
          imagePath: imageUrl
        }
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: error.message 
      });
    }
  }
);

module.exports = router;