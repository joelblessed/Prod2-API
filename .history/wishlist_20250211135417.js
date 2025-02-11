
// Read wishlist.json
app.get("/wishlist/", (req, res) => {
    fs.readFile(wishlistPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      res.json(jsonData.wishlist);
    });
  });
  
  // Add a new Product in wishlist.json
  app.post("/addTowishlist/", (req, res) => {
    fs.readFile(wishlistPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      const product = { id: jsonData.wishlist.length + 1, ...req.body };
      jsonData.wishlist.push(product);
  
      fs.writeFile(wishlistPath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving data" });
        res.status(201).json(product);
      });
    });
  });
  
  // Utility: Read wishlist data from file
  const readProductsWishList = () => {
    const rawData = fs.readFileSync(wishlistPath);
    const data = JSON.parse(rawData);
    return data.wishlist;
  };
  
  // Utility: Write updated wishlist back to file
  const writeProductsWishList = (wishlist) => {
    const data = { wishlist };
    fs.writeFileSync(wishlistPath, JSON.stringify(data, null, 2));
  };
  // Endpoint to get a single product by id
  app.get("/wishlist/id", (req, res) => {
    try {
      const products = readProductsWishList();
      const id = parseInt(req.params.id, 10);
      const product = wishlist.find((p) => p.id === id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Failed to read products data" });
    }
  });
  
  // PATCH endpoint to update a product partially
  app.patch("/updateWishlist/:id", (req, res) => {
    try {
      const products = readProductsWishList();
      const id = parseInt(req.params.id, 10);
      const index = wishlist.findIndex((p) => p.id === id);
  
      if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Merge the existing product with the fields sent in the request body
      const updatedProduct = { ...products[index], ...req.body };
      products[index] = updatedProduct;
  
      // Write the updated products back to the file
      writeProductsWishList(products);
  
      res.json(updatedProduct);
    } catch (err) {
      console.error("Error patching product:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  
  // *API to Delete an Item by ID wishlist*
  app.delete("/wishlistRemoveItem/:id", (req, res) => {
    fs.readFile(wishlistPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      let db = JSON.parse(data);
      const itemId = parseInt(req.params.id);
  
      // Find the item index
      const itemIndex = db.wishlist.findIndex((item) => item.id === itemId);
      if (itemIndex === -1)
        return res.status(404).json({ message: "Item not found" });
  
      // Remove the item
      db.wishlist.splice(itemIndex, 1);
  
      // Save updated data to db.json
      fs.writeFile(wishlistPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving database" });
  
        res.json({ message: "product deleted successfully" });
      });
    });
  });  