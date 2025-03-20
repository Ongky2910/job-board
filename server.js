const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const protectedRoute = require("./routes/protectedRoute");
const jobRoutes = require("./routes/jobRoutes");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://job-board-eight-peach.vercel.app",
  "https://job-board-p17m7qhy1-ongky-ongs-projects.vercel.app",
  "http://localhost:5173"
];

// ✅ Logging Middleware
app.use((req, res, next) => {
  console.log(`🔵 ${req.method} request to ${req.url}`);
  console.log("🔵 Headers:", req.headers);
  next();
});

// ✅ CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ✅ Middleware Utama
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Logging Body Request
app.use((req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    console.log("🟢 Body received:", req.body);
  }
  next();
});

// ✅ Rute Dasar
app.get("/", (req, res) => {
  res.send("Welcome to the Job Board API!");
});

// ✅ Rute Utama
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoute);

// ✅ Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((error) => {
  console.error("❌ MongoDB connection error:", error);
  process.exit(1);
});

// ✅ Memulai Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
