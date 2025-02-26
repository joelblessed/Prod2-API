const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

// Configure storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

// Initialize upload
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle product upload
app.post('/upload', upload.array('images', 10), (req, res) => {
  const productData = req.body;
  const files = req.files;

  // Process product data and files
  // For example, save to database

  res.json({ message: 'Product uploaded successfully!' });
});

app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});