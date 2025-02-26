const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3002;

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

// Initialize upload
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static(uploadDir));

// Route to handle product upload
app.post('/upload', upload.array('images', 10), (req, res) => {
  const productData = req.body;
  const files = req.files;

  // Process product data and files
  const product = {
    id: Date.now(), // Generate a unique ID
    forCount: parseInt(productData.forCount) || 1,
    quantity: parseInt(productData.quantity) || 1,
    price: parseFloat(productData.price) || 0,
    likes: parseInt(productData.likes) || 0,
    discount: parseFloat(productData.discount) || 0,
    numberInStock: parseInt(productData.numberInStock) || 0,
    owner: productData.owner || '',
    phoneNumber: productData.phoneNumber || '',
    name: productData.name || '',
    description: productData.description || '',
    status: productData.status || '',
    brand: [
      {
        id: parseInt(productData.brandId) || 1,
        name: productData.brandName || '',
        image: productData.brandImage || '',
      },
    ],
    images: files.map((file) => `/uploads/${file.filename}`), // Save image paths
    category: productData.category || '',
    location: productData.location || '',
    adress: productData.adress || '',
    isSelected: productData.isSelected === 'true',
  };

  // Save product to db.json
  const dbPath = path.join(__dirname, 'db.json');
  let db = { products: [] };

  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  }

  db.products.push(product);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ message: 'Product uploaded successfully!', product });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});