const express = require("express");
const router = express.Router();

router.get("/hello", (req, res) => {
  res.json({"hello you");
});
module.exports = router;
