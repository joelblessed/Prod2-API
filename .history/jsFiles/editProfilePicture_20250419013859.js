const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
c
const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
const USERS_FILE = path.join(__dirname, 'users.json');
const PROFILE_IMAGES_DIR = path.join(__dirname, 'public', 'profile-images');

// Ensure directories exist
if (!fs.existsSync(PROFILE_IMAGES_DIR)) {
  fs.mkdirSync(PROFILE_IMAGES_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public/profile-images', express.static(PROFILE_IMAGES_DIR));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
    }
  }
});

// Helper functions
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return { users: [] };
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
    throw err;
  }
};

// Update profile image endpoint
router.put('/api/users/:userId/profile-image', 
  upload.single('profileImage'), 
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Validate user ID
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const usersData = readUsers();
      const userIndex = usersData.users.findIndex(user => user.id === parseInt(userId));

      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old profile image if it exists and isn't the default
      const oldImage = usersData.users[userIndex].profileImage;
      if (oldImage && !oldImage.includes('default-avatar')) {
        const oldImagePath = path.join(__dirname, 'public', oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update user with new image path
      const newImagePath = `/public/profile-images/${req.file.filename}`;
      usersData.users[userIndex].profileImage = newImagePath;
      writeUsers(usersData);

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: {
          profileImage: newImagePath,
          user: usersData.users[userIndex]
        }
      });

    } catch (err) {
      console.error('Error updating profile image:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
      });
    }
  }
);

// Get user endpoint (for testing)
router.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const usersData = readUsers();
    const user = usersData.users.find(user => user.id === parseInt(userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;