const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const router= express.Router();
const accountPath = path.join(__dirname, "account.json");


  
  module.exports = router;