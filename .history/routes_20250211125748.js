const express = require("express");
const greet = express.Router();

greet.get("/", (req, res) => {
  res.json({message:"hello you"});
});

gre.get("/", (req, res) => {
  res.json({message:"hello you"});
});
module.exports = greet;
