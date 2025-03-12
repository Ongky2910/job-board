const bcrypt = require("bcrypt");
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
    console.log("🔹 Hashed Password (before saving):", hashedPassword);

    // Create new user
    const newUser = new User({
      displayName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
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
  console.log("Login Request Body:", req.body);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Perbandingan password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Password input:", password);
      console.log("Hashed password from DB:", user.password);
    } catch (error) {
      console.error("Error comparing password:", error);  // Tangani error bcrypt secara langsung
      return res.status(500).json({ message: "Error comparing password", error: error.message });
    }

    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Invalid credentials: Password mismatch");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generasi JWT token jika password valid
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "None", 
      maxAge: 3600000, 
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 604800000, 
    });

    res.status(200).json({ message: "Login successful", token, refreshToken });
  } catch (error) {
    console.error(error);
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

// Refresh Token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Cek apakah refresh token ada
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No refresh token, please login again" });
  }

  try {
    // Verifikasi refresh token menggunakan secret yang tepat
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate token baru menggunakan data yang ada pada refresh token
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
    // Jika refresh token tidak valid atau expired
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  refreshToken,
};
