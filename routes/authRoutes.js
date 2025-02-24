// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { getUserDashboard, getUserJobList } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/dashboard", protect, getUserDashboard);
router.get("/jobs", protect, getUserJobList);
router.post("/logout", logoutUser);

// ✅ Route untuk verifikasi token
router.get("/verify-token", protect, (req, res) => {
  res.json({ user: req.user, valid: true });
});

module.exports = router;
