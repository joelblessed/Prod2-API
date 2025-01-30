const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

const dbPath = path.join(__dirname, "db.json");

// Read db.json
app.get("/users", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.users);
  });
});

// Add a new user to db.json
app.post("/users", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const newUser = { id: jsonData.users.length + 1, ...req.body };
    jsonData.users.push(newUser);