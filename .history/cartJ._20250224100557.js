const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("cart.json");
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(middlewares);

// Get user's cart by userId
server.get("/cart", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  const db = router.db; // Access the database
  const userCart = db.get("cart").find({ userId: Number(userId) }).value();
  
  res.json(userCart ? [userCart] : []);
});

// Update cart items for a user
server.patch("/cart/:userId", (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID is required" });

  const db = router.db;
  const userCart = db.get("cart").find({ userId: Number(userId) });

  if (userCart.value()) {
    // Update existing cart
    userCart.assign({ items }).write();
  } else {
    // Create a new cart for the user
    db.get("cart").push({ userId: Number(userId), items }).write();
  }

  res.json({ success: true, items });
});

server.use(router);
server.listen(3001, () => {
  console.log("JSON Server is running on port 3001");
});