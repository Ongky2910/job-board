const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token; 
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Ambil token dari header
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil user dari database, kecuali password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("⚠️ Token expired, please login again.");
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    console.error("🚨 Invalid token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = { protect };
