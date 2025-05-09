module.export
app.get("/orders/", (req, res) => {
    fs.readFile(ordersPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });
  
      const jsonData = JSON.parse(data);
      res.json(jsonData.orders);
    });
  });