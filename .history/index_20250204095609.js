const express = require("express");
const axios = require('axios');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors =require("cors")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');  // UUID generation for unique identifiers
const bodyParser = require('body-parser');  // Parse incoming request bodies

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const SECRET_KEY = "your-secret-key"; // Change this in production


const app = express();
app.use(bodyParser.json());  // Support for JSON-encoded bodies
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
app.use("/uploads", express.static("uploads")); // Serve uploaded images

const dbPath = path.join(__dirname, "db.json");
const cartPath = path.join(__dirname, "cart.json");
const accountPath = path.join(__dirname, "account.json");
const ordersPath = path.join(__dirname, "orders.json");
const wishlistPath = path.join(__dirname, "wishlist.json");




// Read db.json
app.get("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});

// Add a new Product to db.json
app.post("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const product = { id: jsonData.products.length + 1, ...req.body };
    jsonData.products.push(product);

    fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(product);
    });
  });
});

// *API to Delete an Item by ID*
app.delete("/products/:id", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item index
    const itemIndex = db.cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    // Remove the item
    db.product.splice(itemIndex, 1);

    // Save updated data to db.json
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "product deleted successfully" });
    });
  });
});

// Images
app.use("/images",express.static(path.join(__dirname,"public/images")));

// getFromCart
app.get("/cart", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.cart);
  });
});

// addToCart
app.post("/cart", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const item = { id: jsonData.cart.length + 1, ...req.body };
    jsonData.cart.push(item);

    fs.writeFile(cartPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(item);
    });
  });
});

// Increment cart*
app.put("/cart/:id/increment", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item
    let item = db.cart.find(item => item.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Increment the count
    item.quantity++;

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item count incremented", item });
    });
  });
});

// decrement cart*
app.put("/cart/:id/decrement", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item
    let item = db.cart.find(item => item.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // decrement the count
    item.quantity--;

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item count decremented", item });
    });
  });
});

// *API to Delete an Item by ID*
app.delete("/cart/:id", (req, res) => {
  fs.readFile(cartPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item index
    const itemIndex = db.cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    // Remove the item
    db.cart.splice(itemIndex, 1);

    // Save updated data to db.json
    fs.writeFile(cartPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "Item deleted successfully" });
    });
  });
});

// get orders
app.get("/oreder/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});

// Add a oreders to ordersz.json
app.post("/products/", (req, res) => {
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

// ///////////////////////////

// Read db.json
app.get("/whish/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    res.json(jsonData.products);
  });
});

// Add a new Product to db.json
app.post("/products/", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    const jsonData = JSON.parse(data);
    const product = { id: jsonData.products.length + 1, ...req.body };
    jsonData.products.push(product);

    fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving data" });
      res.status(201).json(product);
    });
  });
});

// *API to Delete an Item by ID*
app.delete("/products/:id", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const itemId = parseInt(req.params.id);

    // Find the item index
    const itemIndex = db.cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    // Remove the item
    db.product.splice(itemIndex, 1);

    // Save updated data to db.json
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });

      res.json({ message: "product deleted successfully" });
    });
  });
});

// ///////////////////////

// *Sign Up (Register User)*
app.post("/signup", async (req, res) => {
  const { email, password, userName, fullName, phone, country, address, gender,role} = req.body;

  fs.readFile(accountPath, "utf8", async (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);

    // Check if user exists
    if (db.users.some(user => user.email === email)) {
      return res.status(400).json({ message: "User already exists" });
      
    }
    

    // Hash password and add user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: db.users.length + 1, email, password: hashedPassword, userName, fullName, phone, country, address, gender,role};
    db.users.push(newUser);

    fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving database" });
      res.json({ message: "User registered successfully" });
    });
  });
});

// *Sign In (Login User)*
app.post("/signin", async (req, res) => {
  const { identifier, password} = req.body;

  fs.readFile(accountPath, "utf8", async (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    const user = db.users.find(user => user.email ===identifier || user.userName === identifier) 
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role:user.role}, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token , role: user.role});
  });
});

// *Protected Route Example*
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    fs.readFile(accountPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading database" });

      let db = JSON.parse(data);
      const user = db.users.find(user => user.id === decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ email: user.email });
    });

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Handle Text & Image Upload
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { title, description } = req.body;
  const image = `${req.file.filename}`;

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    db.products = db.products || [];
    db.products.push({ id: db.products.length + 1, title, description, image });

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving post" });
      res.json({ message: "Post uploaded successfully", post: { title, description, image } });
    });
  });
});

// Fetch All Posts
app.get("/posts", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading database" });

    let db = JSON.parse(data);
    res.json(db.posts || []);
  });
});






// Fake Email Sender (Use real SMTP for production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

// *1. Forgot Password: Generate Reset Link*
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  fs.readFile(accountPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading database" });

    let db = JSON.parse(data);
    let user = db.users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate Reset Token (Valid for 15 minutes)
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Send Email
    transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.json({ message: "Password reset link sent to email." });
  });
});

// *2. Reset Password: Validate Token & Update Password*
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    fs.readFile(accountPath, "utf8", async (err, data) => {
      if (err) return res.status(500).json({ message: "Error reading database" });

      let db = JSON.parse(data);
      let user = db.users.find((u) => u.email === email);
      if (!user) return res.status(400).json({ message: "Invalid token or user not found" });

      // Hash the new password
      user.password = await bcrypt.hash(newPassword, 10);

      fs.writeFile(accountPath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).json({ message: "Error updating password" });
        res.json({ message: "Password updated successfully" });
      });
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});


//////////////////////////////////////////////////////////////////////////////////////////////

// MoMo API configuration
const momoHost = 'sandbox.momodeveloper.mtn.com';  // MoMo API host
const momoTokenUrl = `https://${momoHost}/collection/token/`;  // Token endpoint
const momoRequestToPayUrl = `https://${momoHost}/collection/v1_0/requesttopay`;  // Request to Pay endpoint
const MOMO_SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY; //Subscription key (Primary  or Secondary key) for MoMo API, ideally stored in .env file. 

// Home route - Simple check to confirm the server is running
app.get('/', (req, res) => {
    res.send('MoMo API Server is up and running!');
});

// Endpoint: Create MoMo API User
// This endpoint creates a new API user and returns the user ID (X-Reference-Id).
// This user ID is essential for further actions like retrieving the API key.
app.post('/create-api-user', async (req, res) => {

    const apiUrl = `https://${momoHost}/v1_0/apiuser`;

    // UUID generation for use in API calls where a unique identifier is required
    let uuid = uuidv4();

    // Headers for the MoMo API request
    const headers = {
        'X-Reference-Id': uuid,
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
    };
    // Data payload for the API request
    const data = {
        providerCallbackHost: 'https://525e-41-210-145-67.ngrok-free.app'  // replace with your Callback url
    };

    try {
        const response = await axios.post(apiUrl, data, { headers: headers });
        res.status(200).json({ response: response.data, userId: uuid });  // Returns the response from MoMo API along with the generated userId
    } catch (error) {
        res.status(500).json({ message: 'Error creating API user', error: error.message });
    }
});

// Endpoint: Get Created User by User ID
// This endpoint retrieves details of a created user using their user ID.
// It's useful for validating that a user has been created successfully.
app.get('/get-created-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const apiUrl = `https://${momoHost}/v1_0/apiuser/${userId}`;
    const headers = {
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY
    };

    try {
        const response = await axios.get(apiUrl, { headers: headers });
        res.status(200).json(response.data);  // Successful retrieval returns user details
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving created user', error: error.message });
    }
});

// Endpoint: Retrieve User API Key
// This endpoint retrieves the API key for a specific user, which is used as the password
// in user authentication when generating a MoMo token.
app.post('/retrieve-api-key/:userId', async (req, res) => {
    const userId = req.params.userId;
    const apiUrl = `https://${momoHost}/v1_0/apiuser/${userId}/apikey`;
    const headers = {
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY
    };

    try {
        const response = await axios.post(apiUrl, {}, { headers: headers });
        res.status(200).json(response.data);  // Returns the user's API key
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving API key', error: error.message });
    }
});

// Endpoint: Generate MoMo Token
// This endpoint generates a token used for authorizing payment requests.
// The token is essential for making requests to the `/request-to-pay` endpoint.
app.post('/generate-api-token', async (req, res) => {
    const apiUrl = momoTokenUrl;
    console.log('Token request details:', req.body);
    const { userId, apiKey } = req.body;
    const username = userId;  // Username (X-Reference-Id) from user creation step
    const password = apiKey;  // API Key retrieved from user API key step
    const basicAuth = 'Basic ' + btoa(username + ':' + password);  // Basic Auth header
    const headers = {
        'Authorization': basicAuth,
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY
    };

    try {
        const response = await axios.post(apiUrl, {}, { headers: headers });
        res.status(200).json(response.data);  // Returns the generated token
    } catch (error) {
        res.status(500).json({ message: 'Error generating API token', error: error.message });
    }
});

// Endpoint: Request to Pay
// This endpoint initiates a payment request to a specified mobile number.
// It requires a valid MoMo token and transaction details.
app.post('/request-to-pay', async (req, res) => {
    try {
        console.log('Payment request details:', req.body);
        const { total, phone, momoTokenId } = req.body;

        if (!momoTokenId) {
            return res.status(400).json({ error: 'MoMo token not available' });
        }

        const externalId = uuidv4();
        const body = {
            amount: total,  // Total amount for the transaction
            currency: 'EUR',  // Currency for the transaction
            externalId: externalId,  // Unique ID for each transaction
            payer: {
                partyIdType: 'MSISDN',
                partyId: phone,  // Phone number of the payer
            },
            payerMessage: 'Payment for order',
            payeeNote: 'Payment for order',
        };

        console.log('External Id: ', body.externalId);

        const paymentRefId = uuidv4();  // New UUID for the request
        console.log('PaymentRefId: ', paymentRefId);
        const momoResponse = await axios.post(
            momoRequestToPayUrl,
            body,
            {
                headers: {
                    'X-Reference-Id': paymentRefId,
                    'X-Target-Environment': 'sandbox',
                    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
                    Authorization: `Bearer ${momoTokenId}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({ momoResponse: momoResponse.data, success: true, paymentRefId: paymentRefId, externalId: externalId });  // Returns response from MoMo API
    } catch (error) {
        console.error('Error in processing payment request:', error);
        res.status(500).json({ error: `An error occurred: ${error.message}` });
    }
});

// Endpoint: Get Request to Pay Transaction Status
// This operation is used to get the status of a request to pay. X-Reference-Id that was passed in the post is used as reference to the request.
// The Bearer Authentication Token generated using CreateAccessToken API Call use to make a payment request
// It is useful for confirming the status of a transaction initiated by the `/request-to-pay` endpoint.
app.get('/payment-status/:transactionId/:momoTokenId', async (req, res) => {
    const transactionId = req.params.transactionId;
    const momoTokenId = req.params.momoTokenId;
    const apiUrl = `https://${momoHost}/collection/v1_0/requesttopay/${transactionId}`;
    const headers = {
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
        Authorization: `Bearer ${momoTokenId}`,
        'X-Target-Environment': 'sandbox'
    };

    try {
        const response = await axios.get(apiUrl, { headers: headers });
        res.status(200).json(response.data);  // Returns the status of the payment transaction
    } catch (error) {
        console.error('Error in retrieving payment status:', error);
        res.status(500).json({ error: `An error occurred: ${error.message}` });
    }
});


// ///////////////////////////////////////////////////////////////////////////////////////////
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


