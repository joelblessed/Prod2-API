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
    color:productData.color,
    weight:productData.weight,
    :productData.city,
   
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

module.exports =router