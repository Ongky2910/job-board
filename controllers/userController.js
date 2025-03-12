const User = require("../models/User");
const Job = require("../models/Job");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

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
      match: { deleted: false }, // Filter pekerjaan yang dihapus
      populate: { path: "postedBy", select: "name email" },
    });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const appliedJobs = user.appliedJobs || [];
  const savedJobs = user.savedJobs || [];

  return res.status(200).json({
    user: {
      name: user.displayName,
      email: user.email,
      jobApplied: appliedJobs.length,
      jobSaved: savedJobs.length,
      appliedJobs: appliedJobs,
      savedJobs: savedJobs,
    },
  });
});

// Fungsi untuk mendapatkan daftar pekerjaan yang diposting oleh user
const getUserJobList = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const jobs = await Job.find({ postedBy: userId });

  if (jobs.length === 0) {
    return res.status(404).json({ message: "No jobs found" });
  }

  return res.status(200).json(jobs);
});

// Fungsi untuk memperbarui profil pengguna
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { displayName, email, oldPassword, newPassword, contact, avatar } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update nama & email jika ada
  if (displayName) user.displayName = displayName;
  if (email) user.email = email;

  // Update kontak jika ada
  if (contact) user.contact = contact;

  // Update avatar jika ada
  if (avatar) user.avatar = avatar;

  // Jika user ingin mengubah password
  if (oldPassword && newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully",
    user: {
      displayName: user.displayName,
      email: user.email,
      contact: user.contact,
      avatar: user.avatar,
    },
  });
});

module.exports = {
  getUserDashboard,
  getUserJobList,
  updateUserProfile,
};
