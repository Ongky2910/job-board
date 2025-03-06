const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register User
const registerUser = async (req, res) => {
  const { displayName, email, password } = req.body;

  console.log("Received data:", req.body);
  console.log("Received password:", password);
  console.log("Type of password:", typeof password);

  try {
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid password format" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
   

    // Create new user
    const newUser = new User({ displayName, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Simpan token dalam HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Bandingkan password yang diinput dengan hashed password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Buat token JWT dengan struktur yang benar
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );


    // ✅ Simpan token dalam HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        displayName: user.displayName, 
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = async (req, res) => {
  try {
    // Periksa apakah token valid
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Invalid token", valid: false });
    }

    // Ambil user dari database berdasarkan ID token
    const user = await User.findById(req.user.id).select("displayName email");

    if (!user) {
      return res.status(401).json({ message: "User not found", valid: false });
    }

    res.json({
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
      valid: true,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Server error", valid: false });
  }
};


const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; 
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token, please login again" });
  }
  console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);


  try {
    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Buat token baru
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } 
    );

    // Simpan token baru ke cookie
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};


// Logout User
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      // Kosongkan cookie
      httpOnly: true,
      expires: new Date(0), 
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      expires: new Date(0), 
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, verifyToken, refreshToken };
