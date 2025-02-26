const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3002;

// Ensure the uploads directory exists
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}); // Unique filename
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle product upload
app.post('/uploads', upload.array('images', 10), (req, res) => {
  const productData = req.body;
  const files = req.files;

  // Map file paths to their URLs
  const imageUrls = files.map(file => /uploads/${file.filename});

  // Combine product data with image URLs
  const newProduct = {
    ...productData,
    images: imageUrls,
    price: parseFloat(productData.price),
    quantity: parseInt(productData.quantity),
    numberInStock: parseInt(productData.numberInStock),
    discount: parseFloat(productData.discount),
    likes: parseInt(productData.likes),
  };

  // Here, you would typically save the newProduct to your database
  // For demonstration, we'll just return the product data

  res.status(201).json({
    message: 'Product uploaded successfully!',
    product: newProduct
  });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
})