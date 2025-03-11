const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Job = require("../models/Job");

const { 
  getUserJobList, 
  createJob, 
  updateJob, 
  deleteJob, 
  removeSavedJob,
  restoreJob, 
  applyJob, 
  getAppliedJobs, 
  unapplyJob,
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

// Mendapatkan daftar semua pekerjaan (GET /api/jobs)
router.get("/", protect, getUserJobList);


// ✅ Tambahkan route untuk restore job
router.put("/:id/restore", protect, restoreJob);

// CRUD Job - Hanya pengguna yang login bisa mengelola pekerjaan
router.route("/:id")
  .put(protect, updateJob)
  .delete(protect, deleteJob);

// Membuat pekerjaan (POST /api/jobs)
router.post("/", protect, createJob);

// Apply & Save Job - Hanya user login yang bisa apply/save job
router.post("/:id/apply", protect, applyJob);
router.post("/:id/save", protect, saveJob);

router.delete("/saved/:id", protect, removeSavedJob);

// Mendapatkan daftar job yang telah dilamar & disimpan user
router.get("/applied", protect, getAppliedJobs);
router.get("/saved", protect, getSavedJobs);

router.delete("/:id/unapply", protect, unapplyJob);

// Mendapatkan daftar pekerjaan dari API eksternal
router.get("/external-jobs", protect, getExternalJobListings);

module.exports = router;
