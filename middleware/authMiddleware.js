const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  console.log('Protect middleware executed');
  const token = req.header("Authorization")?.split(" ")[1]; // Ambil token dari header Authorization

  if (!token) {
    console.log("No token found"); 
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verifikasi token menggunakan JWT_SECRET dari environment variable
    console.log("Verifying token:", token); 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user:", decoded);
  
    // Pastikan ada id di decoded.user sebelum melanjutkan
    if (decoded.user && decoded.user.id) {
      req.user = decoded.user; 
      console.log("User authenticated:", req.user);
      next(); // Panggil middleware selanjutnya
    } else {
      return res.status(400).json({ message: "User ID is missing from token" });
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { protect };
