const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Job = require("../models/Job");

const { 
  getUserJobList, 
  createJob, 
  updateJob, 
  deleteJob, 
  applyJob, 
  getAppliedJobs, 
  saveJob, 
  getSavedJobs, 
  getExternalJobListings 
} = require("../controllers/jobController");

const { protect } = require("../middleware/authMiddleware");

console.log("Job Routes Loaded");

// Middleware untuk logging akses route
router.use((req, res, next) => {
  console.log(`Accessing ${req.method} ${req.originalUrl}`);
  next();
});

// GET /api/jobs - Mendapatkan daftar pekerjaan dengan filter & pagination
router.get("/", async (req, res) => {
  const { user_id, location, job_type, search, page, limit } = req.query;

  // Buat query untuk MongoDB berdasarkan parameter yang diterima
  const query = {
    ...(user_id && { postedBy: new mongoose.Types.ObjectId(user_id) }),
    ...(location && { location }),
    ...(job_type && { job_type }),
    ...(search && { 
      $or: [
        { title: { $regex: search, $options: 'i' } }, 
        { description: { $regex: search, $options: 'i' } } 
      ] 
    }),
  };

  // Konversi pagination
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 6;
  const skip = (pageNumber - 1) * pageSize;

  console.log("Final Query for MongoDB:", JSON.stringify(query, null, 2));
  console.log(`Pagination - Skip: ${skip}, Limit: ${pageSize}`);

  try {
    const jobs = await Job.find(query).skip(skip).limit(pageSize);
      console.log("Jobs Found:", jobs);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// CRUD Job - Hanya pengguna yang login bisa mengelola pekerjaan
router.route("/:id")
  .put(protect, updateJob)
  .delete(protect, deleteJob);

// Membuat pekerjaan (POST /api/jobs)
router.post("/", protect, createJob);

// Apply & Save Job - Hanya user login yang bisa apply/save job
router.post("/:id/apply", protect, applyJob);
router.post("/:id/save", protect, saveJob);

// Mendapatkan daftar job yang telah dilamar & disimpan user
router.get("/applied", protect, getAppliedJobs);
router.get("/saved", protect, getSavedJobs);

// Mendapatkan daftar pekerjaan dari API eksternal
router.get("/external-jobs", protect, getExternalJobListings);

module.exports = router;
