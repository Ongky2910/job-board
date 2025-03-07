const User = require("../models/User");
const Job = require("../models/Job");
const asyncHandler = require("express-async-handler");

// Fungsi untuk mendapatkan dashboard pengguna
const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId)
    .populate({
      path: "savedJobs",
      match: { deleted: false } // Filter pekerjaan yang dihapus
    })
    .populate({
      path: "appliedJobs",
      match: { deleted: false } // Filter pekerjaan yang dihapus
    });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const appliedJobs = await Job.find({ appliedBy: userId }).countDocuments();
  console.log("Applied Jobs Count:", appliedJobs);

  const savedJobs = user.savedJobs || [];

  return res.status(200).json({
    user: {
      name: user.displayName,
      email: user.email,
      jobApplied: appliedJobs,
      jobSaved: savedJobs.length,
      appliedJobs: appliedJobs,
      savedJobs: savedJobs,
    },
  });
});


// Fungsi untuk mendapatkan daftar pekerjaan yang diposting oleh user
const getUserJobList = asyncHandler(async (req, res) => {
  const userId = req.user.id;  

  // Ambil semua pekerjaan yang diposting oleh user
  const jobs = await Job.find({ postedBy: userId });

  if (jobs.length === 0) {
    return res.status(404).json({ message: "No jobs found" });
  }

  return res.status(200).json(jobs);
});

module.exports = {
  getUserDashboard,
  getUserJobList,
};
