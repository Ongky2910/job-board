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
  "http://localhost:5173",
];

// Middleware
app.use(cors({
  origin: ["https://job-board-p17m7qhy1-ongky-ongs-projects.vercel.app"], 
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(express.json()); 
app.use(cookieParser()); 

// Rute dasar
app.get("/", (req, res) => {
  res.send("Welcome to the Job Board API!");
});

// Rute pekerjaan menggunakan jobRoutes
app.use("/api/jobs", jobRoutes); 

// Rute yang dilindungi dan autentikasi
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoute);

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((error) => {
  console.error("❌ MongoDB connection error: ", error);
  process.exit(1);
});

// Memulai server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

