const User = require("../models/User");
const Job = require("../models/Job");

// Fungsi untuk mendapatkan dashboard pengguna
const getUserDashboard = async (req, res) => {
  try {
    // Ambil user yang login menggunakan ID dari token atau session
    const userId = req.user.id; // Misalnya ID user diambil dari JWT token
    console.log("User ID:", userId);  

    // Cari data user berdasarkan ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ambil jumlah pekerjaan yang sudah diterapkan oleh user
    const appliedJobs = await Job.find({ postedBy: userId }).countDocuments();

    // Ambil jumlah pekerjaan yang disimpan (jika ada fitur bookmark)
    const savedJobs = user.savedJobs || [];  // Misal: `savedJobs` adalah array ID pekerjaan yang disimpan

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        jobApplied: appliedJobs,
        jobSaved: savedJobs.length,
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
