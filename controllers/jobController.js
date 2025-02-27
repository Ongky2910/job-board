const axios = require("axios");
const Job = require("../models/Job");



// ✅ Mendapatkan daftar pekerjaan yang diposting oleh pengguna
const getUserJobList = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const { location, job_type, contractType, workType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filterCriteria = {
      postedBy: userId,
      ...(location && { location }),
      ...(job_type && { category: job_type }),
      ...(contractType && { contractType }),
      ...(workType && { workType }),
    };

    const dbJobs = await Job.find(filterCriteria)
      .populate("postedBy", "name email")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(dbJobs);
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
      return res
        .status(400)
        .json({ message: "Title, company, and description are required" });
    }

    const newJob = new Job({
      title,
      company,
      description,
      location: job.location.display_name,
      externalId: job.id,
      postedBy: req.user?.id || null,
      isExternal: true,
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
    const { title, company, description, contractType, workType } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found or has been deleted" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You are not the owner of this job" });
    }

    if (title) job.title = title;
    if (company) job.company = company;
    if (description) job.description = description;
    if (contractType) job.contractType = contractType;
    if (workType) job.workType = workType;

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Menghapus pekerjaan dengan validasi
const deleteJob = async (req, res) => {
  try {
    // Cek apakah user sudah login
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Validasi ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    // Cari job
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Cek kepemilikan job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You are not the owner of this job" });
    }

    // Soft delete job
    job.deleted = true;
    await job.save();

    res.status(200).json({ message: "Job deleted successfully (soft delete)" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const restoreJob = async (req, res) => {
  try {
    console.log("Restore Job Hit!");
    console.log("User ID:", req.user?.id);
    console.log("Job ID:", req.params.id);
    // Cek apakah user sudah login
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Validasi ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    // Cari job
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Cek kepemilikan job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You are not the owner of this job" });
    }

    // Pastikan job sudah dihapus sebelumnya
    if (!job.deleted) {
      return res.status(400).json({ message: "Job is not deleted" });
    }

    // Restore job
    job.deleted = false;
    await job.save();

    res.status(200).json({ message: "Job restored successfully" });
  } catch (err) {
    console.error("Error restoring job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Melamar pekerjaan
const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Cek apakah user sudah apply sebelumnya
    if (job.appliedUsers.includes(userId)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Tambahkan user ke appliedUsers dan naikkan applyCount
    await Job.findByIdAndUpdate(jobId, {
      $addToSet: { appliedUsers: userId },
      $inc: { applyCount: 1 } 
    });

    res.json({ message: "Job applied successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ✅ Mendapatkan pekerjaan yang telah dilamar
const getAppliedJobs = async (req, res) => {
  try {
    console.log("Fetching applied jobs for user:", req.user?.id);

    const jobs = await Job.find({ appliedUsers: req.user.id })
      .populate("postedBy", "name email")
      .lean();

    console.log("Applied jobs found:", jobs.length);

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving applied jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Menyimpan pekerjaan ke daftar favorit
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Jika user sudah menyimpan, hapus dari savedUsers
    if (job.savedUsers.includes(userId)) {
      await Job.findByIdAndUpdate(jobId, {
        $pull: { savedUsers: userId },
        $inc: { saveCount: -1 } // ✅ Kurangi saveCount
      });
      return res.json({ message: "Job unsaved successfully" });
    }

    // Jika belum, tambahkan user ke savedUsers
    await Job.findByIdAndUpdate(jobId, {
      $addToSet: { savedUsers: userId },
      $inc: { saveCount: 1 }
    });

    res.json({ message: "Job saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ✅ Mendapatkan daftar pekerjaan yang disimpan
const getSavedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ savedUsers: req.user.id }).populate(
      "postedBy",
      "name email"
    );
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving saved jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function fetchJobsWithRetry(url, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response && (error.response.status === 429 || error.response.status === 503)) {
        console.warn(`Rate limit hit! Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential Backoff: Delay naik 2x setiap retry
      } else {
        throw error; // Lempar error jika bukan 429 atau 503
      }
    }
  }
  throw new Error("Failed to fetch jobs from Adzuna after multiple attempts.");
}

// ✅ Mengambil daftar pekerjaan dari API eksternal
const getExternalJobListings = async (req, res) => {
  console.log("External jobs route hit!");

  try {
    const location = req.query.where || "New York";  
    const keyword = req.query.what ? `&what=${encodeURIComponent(req.query.what)}` : "";
    const contractTypeFilter = req.query.contractType;
    const workTypeFilter = req.query.workType;

    const app_id = process.env.ADZUNA_APP_ID;
    const app_key = process.env.ADZUNA_APP_KEY;
    const country = process.env.ADZUNA_COUNTRY || "us"; 

    if (!app_id || !app_key) {
      return res.status(500).json({ message: "Missing API credentials" });
    }

    const page = parseInt(req.query.page) || 1;
    const apiUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${app_id}&app_key=${app_key}&where=${encodeURIComponent(location)}${keyword}`;

    console.log("Fetching data from:", apiUrl);

    const jobData = await fetchJobsWithRetry(apiUrl);
    const externalJobs = jobData.results;

    let savedJobs = await Promise.all(
      externalJobs.map(async (job) => {
        let existingJob = await Job.findOne({ externalId: job.id });

        if (!existingJob) {
          let workType = "Onsite"; // Default

          if (job.category?.label.toLowerCase().includes("remote")) {
            workType = "Remote";
          } else if (job.category?.label.toLowerCase().includes("hybrid")) {
            workType = "Hybrid";
          }

          existingJob = new Job({
            title: job.title,
            company: job.company?.display_name || "Unknown Company",
            description: job.description || "No description available.",
            location: job.location?.display_name || "Unknown Location",
            contractType: job.contract_time 
            ? job.contract_time.replace("_", "-").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) 
            : "Full-Time",
            workType, 
            externalId: job.id,
          });

          await existingJob.save();
        }
        return existingJob;
      })
    );

    if (contractTypeFilter) {
      savedJobs = savedJobs.filter(job => job.contractType === contractTypeFilter);
    }

    if (workTypeFilter) {
      savedJobs = savedJobs.filter(job => job.workType === workTypeFilter);
    }

    res.json(savedJobs);
  } catch (error) {
    console.error("Error fetching and saving jobs:", error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};


module.exports = {
  getUserJobList,
  createJob,
  updateJob,
  deleteJob,
  restoreJob, 
  applyJob,
  getAppliedJobs,
  saveJob,
  getSavedJobs,
  getExternalJobListings,
};
