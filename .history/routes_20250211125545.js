const express = require("express");
const router = express.Router();

greet.get("/", (req, res) => {
  res.json({message:"hello you"});
});
module.exports = greet;
