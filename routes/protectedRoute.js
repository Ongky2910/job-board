const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route yang memerlukan autentikasi JWT
router.get("/protected", protect, (req, res) => {
  console.log("Accessing /protected route");
  res.status(200).json({ message: "You have access to this protected route" });
});

module.exports = router;
