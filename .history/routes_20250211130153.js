const express = require("express");
const [greet, go ]= express.Router();

greet.get("/", (req, res) => {
  res.json({message:"hello you"});
});

go.get("/", (req, res) => {
  res.json({message:"go you"});
});
module.exports = go,greet;
