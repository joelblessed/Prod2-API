const express = require("express");
const fs = require("fs");
const path = require("path");
const router= express.Router();
const dbPath = path.join(__dirname, "../jsonFiles/db.json");


// Read db.json
router.get("/products", (req, res) => {
    fs.readFile(dbPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      res.json(jsonData.products);
    });
  });
  
  

  module.exports = router;