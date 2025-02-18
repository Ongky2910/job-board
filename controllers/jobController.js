const axios = require('axios');
const Job = require('../models/Job');

console.log("Job Controller Loaded");

// Mendapatkan pekerjaan yang diposting oleh pengguna
const getUserJobList = async (req, res) => {
  console.log('User:', req.user); // Log untuk memeriksa user

  const userId = req.user?.id;  // Pastikan req.user sudah ada
  if (!userId) {
    console.log("User ID is missing");
    return res.status(400).json({ message: "User ID is missing" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    console.log("Fetching jobs for user ID:", userId);
    const jobs = await Job.find({ postedBy: userId })
      .populate("postedBy", "name email")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving jobs:", err);
    res.status(500).json({ message: "Error retrieving jobs" });
  }
};


const createJob = async (req, res) => {
  console.log("createJob executed");
  try {
    const { title, company, description } = req.body;
    console.log("Received job data:", { title, company, description });

    // Validasi data input
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
    console.log("Job created successfully:", newJob);
    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Error creating job" });
  }
};

const updateJob = async (req, res) => {
  console.log("updateJob executed for job ID:", req.params.id);
  try {
    const { title, company, description } = req.body;
    const jobId = req.params.id;
    console.log("Updating job with new data:", { title, company, description });

    // Validasi data input
    if (!title || !company || !description) {
      return res.status(400).json({ message: "Title, company, and description are required" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { title, company, description },
      { new: true }
    );

    if (!updatedJob) {
      console.log("Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("Job updated successfully:", updatedJob);
    res.status(200).json(updatedJob);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Error updating job" });
  }
};

const deleteJob = async (req, res) => {
  console.log("deleteJob executed for job ID:", req.params.id);
  try {
    const jobId = req.params.id;
    const deletedJob = await Job.findByIdAndDelete(jobId);

    if (!deletedJob) {
      console.log("Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("Job deleted successfully:", deletedJob);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Error deleting job" });
  }
};

const applyJob = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  console.log(`User ${userId} applying for job ID: ${jobId}`);
  
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    // Initialize appliedUsers array if not already set
    if (!job.appliedUsers) {
      job.appliedUsers = [];
    }

    if (job.appliedUsers.includes(userId)) {
      console.log("User has already applied to this job");
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    job.appliedUsers.push(userId);
    await job.save();

    console.log("Application successful for job ID:", jobId);
    res.status(200).json({ message: "Application successful" });
  } catch (err) {
    console.error("Error applying to job:", err);
    res.status(500).json({ message: "Error applying to job" });
  }
};

const getAppliedJobs = async (req, res) => {
  console.log("Getting applied jobs for user ID:", req.user.id);
  try {
    const jobs = await Job.find({ appliedUsers: req.user.id }).populate("postedBy", "name email");
    console.log("Applied jobs retrieved:", jobs);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving applied jobs:", err);
    res.status(500).json({ message: "Error retrieving applied jobs" });
  }
};

const saveJob = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  console.log(`User ${userId} saving job ID: ${jobId}`);

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    // Initialize savedUsers array if not already set
    if (!job.savedUsers) {
      job.savedUsers = [];
    }

    if (job.savedUsers.includes(userId)) {
      console.log("User has already saved this job");
      return res.status(400).json({ message: "You have already saved this job" });
    }

    job.savedUsers.push(userId);
    await job.save();

    console.log("Job saved successfully for job ID:", jobId);
    res.status(200).json({ message: "Job saved successfully" });
  } catch (err) {
    console.error("Error saving job:", err);
    res.status(500).json({ message: "Error saving job" });
  }
};

const getSavedJobs = async (req, res) => {
  console.log("Getting saved jobs for user ID:", req.user.id);
  try {
    const jobs = await Job.find({ savedUsers: req.user.id }).populate("postedBy", "name email");
    console.log("Saved jobs retrieved:", jobs);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving saved jobs:", err);
    res.status(500).json({ message: "Error retrieving saved jobs" });
  }
};

async function getExternalJobListings(req, res) {
  const { location, job_type, app_id, app_key } = req.query;
  
  console.log('Received Params:', req.query); 
  
  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: {
        location: location || 'remote',
        job_type: job_type || 'fulltime',
        app_id: app_id || 'b258b0a3',
        app_key: app_key || '63e9e6b82c2775f5e164d60d8fee0012',
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching jobs from external API:', error);

    // Menampilkan detail error dari respons API
    if (error.response) {
      console.error('Response error status:', error.response.status);
      console.error('Response error data:', error.response.data);
      res.status(error.response.status).json({ message: error.response.data });
    } else if (error.request) {
      // Jika tidak ada respons
      console.error('Request error:', error.request);
      res.status(500).json({ message: 'No response received from API' });
    } else {
      // Kesalahan lain
      console.error('Unknown error:', error.message);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
}

module.exports = { 
  getUserJobList, 
  createJob, 
  updateJob, 
  deleteJob, 
  applyJob, 
  getAppliedJobs, 
  saveJob, 
  getSavedJobs, 
  getExternalJobListings 
};
