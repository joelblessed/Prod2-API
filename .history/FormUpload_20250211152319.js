const express = require("express");
const axios = require("axios");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid"); // UUID generation for unique identifiers
const bodyParser = require("body-parser"); // Parse incoming request bodies
const app = express();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const SECRET_KEY = "your-secret-key"; // Change this in production

app.use(bodyParser.json({ limit: "50mb" })); // Support for JSON-encoded bodies
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
// app.use("upload", express.static("upload"))

app.use("/images", express.static(path.join(__dirname, "public/images")));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with timestamp
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

// Endpoint to handle the file + text upload
app.post("/upload", upload.array("files", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const fileUrls = req.files.map((file) => `/images/${file.filename}`);
  const { title, description } = req.body;

  // Prepare data to store in db.json
  const newData = {
    id: Date.now(),
    title,
    description,
    image: fileUrls,
  };

  // Read existing db.json data
  fs.readFile("./db.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read db.json" });
    }

    // Parse the existing data
    const db = JSON.parse(data);
    db.products.push(newData); // Add new data to the existing array

    // Save the updated data back to db.json
    fs.writeFile("./db.json", JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to save data to db.json" });
      }
      res.json({ message: "Files uploaded successfully", data: newData });
    });
  });
});