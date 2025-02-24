const User = require("../models/User");
const Job = require("../models/Job");

// Fungsi untuk mendapatkan dashboard pengguna
const getUserDashboard = async (req, res) => {
  try {
    // Ambil user yang login menggunakan ID dari token atau session
    const userId = req.user.id; // Misalnya ID user diambil dari JWT token
    console.log("User ID:", userId);  

    // Cari data user berdasarkan ID
    const user = await User.findById(userId).populate("savedJobs"); 
    if (!user) {
      console.log("User not found");
    } else {
      console.log("User found:", user);
    }

    // Ambil jumlah pekerjaan yang sudah diterapkan oleh user
    const appliedJobs = await Job.find({ appliedBy: userId }).countDocuments();
    console.log("Applied Jobs Count:", appliedJobs);
    // Ambil jumlah pekerjaan yang disimpan (jika ada fitur bookmark)
    const savedJobs = user.savedJobs || [];  

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        jobApplied: appliedJobs,
        jobSaved: savedJobs.length,
        appliedJobs: appliedJobs,
        savedJobs: savedJobs,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fungsi untuk mendapatkan daftar pekerjaan yang diposting oleh user
const getUserJobList = async (req, res) => {
  try {
    const userId = req.body.userId;  // Ambil ID user dari token atau session

    // Ambil semua pekerjaan yang diposting oleh user
    const jobs = await Job.find({ postedBy: userId });

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    return res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserDashboard,
  getUserJobList,
};
