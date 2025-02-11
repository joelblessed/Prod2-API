
const express = require("express");

const fs = require("fs");

const path = require("path");

const app = express();


const router= express.Router();

const ordersPath = path.join(__dirname, "orders.json");

router.get("/", (req, res) => {
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.orders);
  });
});


module.exports = router;
