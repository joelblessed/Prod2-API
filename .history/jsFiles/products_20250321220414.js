const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to db.json
const dbPath = path.join(__dirname, "db.json");

// Initialize db.json if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ products: [] }));
}

// Helper function to read db.json
const readDB = () => {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

// Helper function to write to db.json
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public", "images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save with the original file name
  },
});

const upload = multer({ storage });

// Create user if not exists
app.post("/api/user", (req, res) => {
  const { username, userId } = req.body;
  const db = readDB();

  // Check if user already exists
  const userExists = db.products.some(
    (product) => product.user.some((u) => u.userId === userId)
  );
  if (userExists) {
    return res.status(200).json({ message: "User already exists" });
  }

  // Create new user with an empty products array
  if (!db.products.length) {
    db.products.push({ user: [] });
  }
  db.products[0].user.push({ username, userId, products: [] });
  writeDB(db);

  res.status(201).json({ message: "User created successfully" });
});

// Upload product
app.post("/api/upload", upload.array("images"), (req, res) => {
  const product = req.body;
  const db = readDB();

  // Save image file paths
  const imagePaths = req.files.map((file) => /images/${file.originalname});

  // Find the user's product array
  const user = db.products[0].user.find((u) => u.userId === product.ownerId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Add product to the user's products array
  user.products.push({
    ...product,
    images: imagePaths, // Save image paths
  });
  writeDB(db);

  res.status(201).json({ message: "Product uploaded successfully" });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Start server
app.listen(PORT, () => {
  console.log(Server is running on http://localhost:${PORT});
});