const axios = require("axios");
const Job = require("../models/Job");

// ✅ Middleware autentikasi HARUS sudah diterapkan sebelum fungsi ini dipanggil
console.log("Job Controller Loaded");

// ✅ Mendapatkan daftar pekerjaan yang diposting oleh pengguna
const getUserJobList = async (req, res) => {
  console.log('User:', req.user); 
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    console.log("Fetching jobs for user ID:", userId);

    const { location, job_type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build the filter criteria, ensuring optional parameters are handled properly
    const filterCriteria = {
      
      postedBy: userId,
      ...(location && { location }),  // Only include location if provided
      ...(job_type && { category: job_type }), // Ensure job_type matches the category field in your schema
    };

    // Fetch jobs with the given filter criteria, using pagination
    const jobs = await Job.find(filterCriteria)
      .populate("postedBy", "name email") // Populating user info
      .skip((page - 1) * limit) // Pagination logic
      .limit(limit); // Limit results to the specified limit

      console.log("Fetched jobs:", jobs);
    // Return the jobs
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Membuat pekerjaan baru
const createJob = async (req, res) => {
  try {
    const { title, company, description } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ message: "Title, company, and description are required" });
    }

    const newJob = new Job({
      title,
      company,
      description,
      postedBy: req.user.id,
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Mengupdate pekerjaan
const updateJob = async (req, res) => {
  try {
    const { title, company, description } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ message: "Title, company, and description are required" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { title, company, description },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(updatedJob);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Menghapus pekerjaan
const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Melamar pekerjaan
const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.appliedUsers) {
      job.appliedUsers = [];
    }

    if (job.appliedUsers.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    job.appliedUsers.push(req.user.id);
    await job.save();

    res.status(200).json({ message: "Application successful" });
  } catch (err) {
    console.error("Error applying to job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Mendapatkan pekerjaan yang telah dilamar
const getAppliedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ appliedUsers: req.user.id }).populate("postedBy", "name email");
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving applied jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Menyimpan pekerjaan ke daftar favorit
const saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.savedUsers) {
      job.savedUsers = [];
    }

    if (job.savedUsers.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already saved this job" });
    }

    job.savedUsers.push(req.user.id);
    await job.save();

    res.status(200).json({ message: "Job saved successfully" });
  } catch (err) {
    console.error("Error saving job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Mendapatkan daftar pekerjaan yang disimpan
const getSavedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ savedUsers: req.user.id }).populate("postedBy", "name email");
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving saved jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Mengambil daftar pekerjaan dari API eksternal
const getExternalJobListings = async (req, res) => {
  try {
    const { location, job_type, app_id, app_key } = req.query;
    const response = await axios.get("https://api.adzuna.com/v1/api/jobs/us/search/1", {
      params: {
        location: location || "remote",
        job_type: job_type || "fulltime",
        app_id: app_id || "your_app_id",
        app_key: app_key || "your_app_key",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching jobs from external API:", error.message);
    res.status(500).json({ message: "Error fetching external job listings" });
  }
};

module.exports = {
  getUserJobList,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
  getAppliedJobs,
  saveJob,
  getSavedJobs,
  getExternalJobListings,
};
