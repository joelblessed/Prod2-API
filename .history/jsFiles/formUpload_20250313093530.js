const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const app = express();


// Enable CORS for frontend-backend communication



// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./public/images",
  filename: (req, file, cb) => {
      cb(null,file.originalname); // Rename the file with timestamp
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});



// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded images)

app.use("/images",express.static(path.join(__dirname,"./public/images")));

// Route to handle product upload
router.post("/upload", upload.array("images", 11), (req, res) => {
  const productData = req.body;
  const files = req.files;

  // Construct the product object
  const newProduct = {
    id: Date.now(), // Generate a unique ID
    postedOn:productData.postedOn,
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
    city:productData.city,
    location:JSON.parse(productData.location),
    images: files.map((file) => `/images/${file.filename}`), // Save image paths
  };

  // Save product to db.json
  const dbPath = path.join(__dirname, "../jsonFiles/db.json");
  let db = { products: [] };

  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  }

  db.products.push(newProduct);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ message: "Product uploaded successfully!", product: newProduct });
});



// Update a product by ID
.put('/updateProduct/:id', upload.array('images'), (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const productIndex = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    const updatedProduct = { ...db.products[productIndex], ...JSON.parse(req.body.product) };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      updatedProduct.images = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    }

    db.products[productIndex] = updatedProduct;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});






// Route to handle product update by ID
router.put("/update/:id", upload.array("images", 11), (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedData = req.body;
  const files = req.files;

  // Read the existing products from db.json
  const dbPath = path.join(__dirname, "./jsonFiles/db.json");
  let db = { products: [] };

  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  }

  // Find the product by ID
  const productIndex = db.products.findIndex((product) => product.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Update the product details
  const updatedProduct = {
    ...db.products[productIndex],
    ...updatedData,
    price: parseFloat(updatedData.price),
    quantity: parseInt(updatedData.quantity),
    numberInStock: parseInt(updatedData.numberInStock),
    discount: parseFloat(updatedData.discount),
    likes: parseInt(updatedData.likes),
    brand: JSON.parse(updatedData.brand),
    location: JSON.parse(updatedData.location),
    images: files.length > 0 ? files.map((file) => `/images/${file.filename}`) : db.products[productIndex].images,
  };

  db.products[productIndex] = updatedProduct;

  // Save the updated products back to db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ message: "Product updated successfully!", product: updatedProduct });
});

module.exports =router