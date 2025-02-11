const express = require("express");
const fs = require("fs");
const path = require("path");
const router= express.Router();
const ordersPath = path.join(__dirname, "orders.json");



// get orders
router.get("/orders/", (req, res) => {
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.orders);
  });
});

// Add a oreders to ordersz.json
router.post("/addTOorders/", (req, res) => {
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const order = { id: jsonData.products.length + 1, ...req.body };
    jsonData.products.push(order);

    fs.writeFile(ordersPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(order);
    });
  });
});

// Utility: Read products data from file
const readProductsOrders = () => {
  const rawData = fs.readFileSync(ordersPath);
  const data = JSON.parse(rawData);
  return data.products;
};

// Utility: Write updated products back to file
const writeProductsOrders = (products) => {
  const data = { products };
  fs.writeFileSync(ordersPath, JSON.stringify(data, null, 2));
};
// Endpoint to get a single product by id
router.get("/orders/:id", (req, res) => {
  try {
    const  = readProductsOrders();
    const id = parseInt(req.params.id, 10);
    const product = orders.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to read products data" });
  }
});

// PATCH endpoint to update a product partially
router.patch("/updateOrders/:id", (req, res) => {
  try {
    const products = readProductsOrders();
    const id = parseInt(req.params.id, 10);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Merge the existing product with the fields sent in the request body
    const updatedProduct = { ...products[index], ...req.body };
    products[index] = updatedProduct;

    // Write the updated products back to the file
    writeProductsOrders(products);

    res.json(updatedProduct);
  } catch (err) {
    console.error("Error patching product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

//  *API to Delete an orders by ID*
router.delete("/ordersRemoveItem/:id", (req, res) => {
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item index
    const itemIndex = db.cart.findIndex((item) => item.id === itemId);
    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found" });

    // Remove the item
    db.orders.splice(itemIndex, 1);

    // Save updated data to db.json
    fs.writeFile(ordersPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "oreder  deleted successfully" });
    });
  });
});



module.exports = router;
