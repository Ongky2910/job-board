const express = require("express");
const router = express.Router();

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

router.use((req, res, next) => {
  console.log("Job Routes accessed");
  next();
});

router.get("/", (req, res) => {
  console.log("Accessing GET /jobs");
  getUserJobList(req, res);
});

router.post("/jobs", protect, (req, res) => {
  console.log("Accessing POST /jobs");
  createJob(req, res);   
});

router.put("/:id", protect, (req, res) => {
  console.log(`Accessing PUT /jobs/${req.params.id}`);
  updateJob(req, res);
});

router.delete("/:id", protect, (req, res) => {
  console.log(`Accessing DELETE /jobs/${req.params.id}`);
  deleteJob(req, res);
});

router.post("/:id/apply", protect, (req, res) => {
  console.log(`Accessing POST /jobs/${req.params.id}/apply`);
  applyJob(req, res);
});

router.post("/:id/save", protect, (req, res) => {
  console.log(`Accessing POST /jobs/${req.params.id}/save`);
  saveJob(req, res);
});

router.get("/applied", protect, (req, res) => {
  console.log("Accessing GET /applied");
  getAppliedJobs(req, res);
});

router.get("/saved", protect, (req, res) => {
  console.log("Accessing GET /saved");
  getSavedJobs(req, res);
});

router.get("/external-jobs", protect, (req, res) => {
  console.log("Accessing GET /external-jobs");
  getExternalJobListings(req, res);
});

module.exports = router;