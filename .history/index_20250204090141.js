const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors =require("cors")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const SECRET_KEY = "your-secret-key"; // Change this in production


const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
app.use("/uploads", express.static("uploads")); // Serve uploaded images

const dbPath = path.join(__dirname, "db.json");
const  = path.join(__dirname, "db.json");
const cartPath = path.join(__dirname, "cart.json");
const accountPath = path.join(__dirname, "account.json");


// Read db.json
app.get("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});

// Add a new Product to db.json
app.post("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const product = { id: jsonData.products.length + 1, ...req.body };
    jsonData.products.push(product);

    fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(product);
    });
  });
});

// Images
app.use("/images",express.static(path.join(__dirname,"public/images")));

// getFromCart
app.get("/cart", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.cart);
  });
});

// addToCart
app.post("/cart", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const item = { id: jsonData.cart.length + 1, ...req.body };
    jsonData.cart.push(item);

    fs.writeFile(cartPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(item);
    });
  });
});

// Increment cart*
app.put("/cart/:id/increment", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item
    let item = db.cart.find(item => item.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Increment the count
    item.quantity++;

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item count incremented", item });
    });
  });
});

// decrement cart*
app.put("/cart/:id/decrement", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item
    let item = db.cart.find(item => item.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // decrement the count
    item.quantity--;

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item count decremented", item });
    });
  });
});

// *API to Delete an Item by ID*
app.delete("/cart/:id", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item index
    const itemIndex = db.cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    // Remove the item
    db.cart.splice(itemIndex, 1);

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item deleted successfully" });
    });
  });
});


app.get("/orders/", (req, res) => {
  fs.readFile(orders, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});


// *Sign Up (Register User)*
app.post("/signup", async (req, res) => {
  const { email, password, userName, fullName, phone, country, address, gender,role} = req.body;

  fs.readFile(accountPath, "utf8", async (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);

    // Check if user exists
    if (db.users.some(user => user.email === email)) {
      return res.status(400).json({ message: "User already exists" });
      
    }
    

    // Hash password and add user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: db.users.length + 1, email, password: hashedPassword, userName, fullName, phone, country, address, gender,role};
    db.users.push(newUser);

    fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });
      res.json({ message: "User registered successfully" });
    });
  });
});

// *Sign In (Login User)*
app.post("/signin", async (req, res) => {
  const { identifier, password} = req.body;

  fs.readFile(accountPath, "utf8", async (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const user = db.users.find(user => user.email ===identifier || user.userName === identifier) 
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role:user.role}, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token , role: user.role});
  });
});

// *Protected Route Example*
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    fs.readFile(accountPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });

      let db = JSON.parse(data);
      const user = db.users.find(user => user.id === decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ email: user.email });
    });

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Handle Text & Image Upload
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { title, description } = req.body;
  const image = `${req.file.filename}`;

  fs.readFile , "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    db.products = db.products || [];
    db.products.push({ id: db.products.length + 1, title, description, image });

    fs.writeFile , JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving post" });
      res.json({ message: "Post uploaded successfully", post: { title, description, image } });
    });
  });
});

// Fetch All Posts
app.get("/posts", (req, res) => {
  fs.readFile , "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    res.json(db.posts || []);
  });
});






// Fake Email Sender (Use real SMTP for production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

// *1. Forgot Password: Generate Reset Link*
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  fs.readFile(accountPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading database" });

    let db = JSON.parse(data);
    let user = db.users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate Reset Token (Valid for 15 minutes)
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Send Email
    transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.json({ message: "Password reset link sent to email." });
  });
});

// *2. Reset Password: Validate Token & Update Password*
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    fs.readFile(accountPath, "utf8", async (err, data) => {
      if (err) return res.status(500).json({ message: "Error reading database" });

      let db = JSON.parse(data);
      let user = db.users.find((u) => u.email === email);
      if (!user) return res.status(400).json({ message: "Invalid token or user not found" });

      // Hash the new password
      user.password = await bcrypt.hash(newPassword, 10);

      fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ message: "Error updating password" });
        res.json({ message: "Password updated successfully" });
      });
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


