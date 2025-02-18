const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const protectedRoute = require("./routes/protectedRoute");
const jobRoutes = require("./routes/jobRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",  // Mengizinkan akses dari frontend
  methods: "GET,POST,PUT,DELETE",  // Metode HTTP yang diizinkan
}));

app.use(express.json()); // Untuk parsing body request dalam format JSON

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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error: ", error);
    process.exit(1); // Keluar jika koneksi gagal
  });

// Memulai server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
