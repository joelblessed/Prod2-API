const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to db.json
const dbPath = path.join(__dirname, "db.json");

// Initialize db.json if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], products: [] }));
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

// Create user if not exists
app.post("/api/user", (req, res) => {
  const { username, userId } = req.body;
  const db = readDB();

  // Check if user already exists
  const userExists = db.users.some((user) => user.userId === userId);
  if (userExists) {
    return res.status(200).json({ message: "User already exists" });
  }

  // Create new user
  db.users.push({ username, userId });
  writeDB(db);

  res.status(201).json({ message: "User created successfully" });
});

// Upload product
app.post("/api/upload", (req, res) => {
  const product = req.body;
  const db = readDB();

  // Add product to db
  db.products.push(product);
  writeDB(db);

  res.status(201).json({ message: "Product uploaded successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(Server is running on http://localhost:${PORT});
});

