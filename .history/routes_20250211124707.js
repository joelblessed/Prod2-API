const express = require("express");
const router = express.Router();

router.get("/hello", (req, res) => {
  res.json({message"hello you"});
});
module.exports = router;
