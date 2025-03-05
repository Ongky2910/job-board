
const express = require("express");
const { registerUser, loginUser, logoutUser, verifyToken } = require("../controllers/authController");
const { getUserDashboard, getUserJobList } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/dashboard", protect, getUserDashboard);
router.get("/jobs", protect, getUserJobList);
router.post("/logout", logoutUser);
router.get("/verify-token", protect, verifyToken);

module.exports = router;
