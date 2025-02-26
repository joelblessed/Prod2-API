const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const router= express.Router();
const app = express();


// Enable CORS for frontend-backend communication
app.use(cors());

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, "public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Initialize upload
const upload = multer({ storage: storage });

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded images)
router.use("/images", express.static(uploadDir));

// Route to handle product upload
router.post("/upload", upload.array("images", 10), (req, res) => {
  const productData = req.body;
  const files = req.files;

  // Construct the product object
  const newProduct = {
    id: Date.now(), // Generate a unique ID
    name: productData.name,
    brand: JSON.parse(productData.brand), // Parse brand array from string
    category: productData.category,
    price: parseFloat(productData.price),
    quantity: parseInt(productData.quantity),
    numberInStock: parseInt(productData.numberInStock),
    discount: parseFloat(productData.discount),
    owner: productData.owner,
    phoneNumber: productData.phoneNumber,
    description: productData.description,
    status: productData.status,
    address: productData.address,
    likes: parseInt(productData.likes),
    location: productData.location,
    images: files.map((file) => `/uploads/${file.filename}`), // Save image paths
  };

  // Save product to db.json
  const dbPath = path.join(__dirname, "db.json");
  let db = { products: [] };

  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  }

  db.products.push(newProduct);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ message: "Product uploaded successfully!", product: newProduct });
});

module.exports = router