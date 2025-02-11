const express = require("express");
const router= express.Router();

router.get("/", (req, res) => {
  res.json({message:"hello you"});
});

router.get("/go", (req, res) => {
  res.json({message:"go you"});
});
module.exports = router;
