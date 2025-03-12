const express = require("express");
const { registerUser, loginUser, logoutUser, verifyToken, refreshToken } = require("../controllers/authController");
const { getUserDashboard, getUserJobList, updateUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/dashboard", protect, getUserDashboard);
router.put("/update-profile", protect, updateUserProfile);
router.get("/jobs", protect, getUserJobList);
router.post("/logout", logoutUser);
router.get("/verify-token", protect, verifyToken);
router.get("/refresh-token", refreshToken);

module.exports = router;
