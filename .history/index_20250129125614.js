const express = require("express");
const fs = require("fs");
const path = require("path");
const cors =require("cors")

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

const dbPath = path.join(__dirname, "db.json");
const cartPath = path.join(__dirname, "Cart.json");

// Read db.json
app.get("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});


// Images
app.use("/images",express.static(path.join(__dirname,"public/images")));

// getFromCart
app.get("/addToCart/", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});



    const jsonData = JSON.parse(data);
    const newUser = { id: jsonData.users.length + 1, ...req.body };
    jsonData.users.push(newProduct);

    fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(newUser);
    });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))