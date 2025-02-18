const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); 


// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log("Received data:", req.body); 

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new userx
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

     // Generate the JWT token
     const token = jwt.sign(
      { user: { id: newUser.id, email: newUser.email } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
   // Send the response with token and user data
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }
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

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate the JWT token
    const token = jwt.sign(
      { user: { id: user._id, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Send the response with token and user data
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        // Add any other user info you want to send
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { registerUser, loginUser, };

