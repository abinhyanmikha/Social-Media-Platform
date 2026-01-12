const express = require("express");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
