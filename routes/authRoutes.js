// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { getUserDashboard, getUserJobList } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); 

const router = express.Router();

router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Route untuk mendapatkan dashboard user
router.get("/dashboard", protect, getUserDashboard);

// Route untuk mendapatkan daftar pekerjaan yang diposting oleh user
router.get("/jobs", protect, getUserJobList);

module.exports = router;
