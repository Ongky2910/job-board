const axios = require("axios");
const Job = require("../models/Job");
const User = require("../models/User"); 

const asyncHandler = require("express-async-handler");

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
    const skip = (page - 1) * limit;

    const filterCriteria = {
      postedBy: userId,
      ...(location && { location }),
      ...(job_type && { category: job_type }),
      ...(contractType && { contractType }),
      ...(workType && { workType }),
    };

    // 🔥 Hitung total pekerjaan tanpa pagination
    const totalJobs = await Job.countDocuments(filterCriteria);

    // 🔥 Ambil data dengan pagination
    const dbJobs = await Job.find(filterCriteria)
      .populate("postedBy", "name email")
      .skip(skip)
      .limit(limit)
      .lean(); // Optimize query

    res.status(200).json({
      jobs: dbJobs,
      totalJobs, // 🔥 Total pekerjaan
      totalPages: Math.ceil(totalJobs / limit), // 🔥 Total halaman
      currentPage: page, // 🔥 Halaman saat ini
    });
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
      return res
        .status(404)
        .json({ message: "Job not found or has been deleted" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not the owner of this job" });
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
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not the owner of this job" });
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

const removeSavedJob = async (req, res) => {
  console.log("Received job ID:", req.params.id);
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    const jobId = req.params.id;
    const userId = req.user.id;

    console.log("Checking for saved job with:", { userId, jobId });

    // Hapus user dari array savedUsers di model Job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $pull: { savedUsers: userId }, $inc: { saveCount: -1 } }, // Kurangi saveCount
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    res.json({ message: "Job removed from saved successfully", job: updatedJob });
  } catch (error) {
    console.error("Error removing saved job:", error);
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
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not the owner of this job" });
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
const applyJob = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    // Cari user dan job berdasarkan id
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    // Jika user atau job tidak ditemukan, kirimkan pesan error 404
    if (!user || !job) {
      return res.status(404).json({ message: "User or Job not found" });
    }

    // Cek jika user sudah melamar pekerjaan ini
    if (job.appliedUsers.includes(userId)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Menambahkan pekerjaan ke appliedUsers jika belum ada
    job.appliedUsers.push(userId);
    user.appliedJobs.push(jobId);
    job.applyCount += 1;

    // Simpan perubahan ke database
    await job.save();
    await user.save();

    // Kirimkan respon sukses
    return res.status(200).json({ message: "Job applied successfully" });
  } catch (error) {
    console.error(error);  // Log error ke console untuk debugging

    // Kirimkan error internal server jika terjadi kesalahan lainnya
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ Mendapatkan pekerjaan yang telah dilamar
const getAppliedJobs = async (req, res) => {
  try {
    console.log("Fetching applied jobs for user:", req.user?.id);

    // Cari user & ambil daftar job yang sudah dilamar
    const user = await User.findById(req.user.id).populate({
      path: "appliedJobs",
      populate: { path: "postedBy", select: "name email" }, 
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Applied jobs found:", user.appliedJobs.length);

    res.status(200).json(user.appliedJobs); 
  } catch (err) {
    console.error("Error retrieving applied jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Menyimpan pekerjaan ke daftar favorit
const saveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Cari pekerjaan dan pengguna berdasarkan ID
    const job = await Job.findById(id);
    const user = await User.findById(userId);
    console.log(user); 
    // Validasi: Pastikan pekerjaan dan pengguna ada
    if (!job || !user) {
      return res.status(404).json({ message: "User or Job not found" });
    }

    // Jika pekerjaan sudah disimpan oleh pengguna, hapus dari savedUsers dan kurangi saveCount
    if (job.savedUsers.includes(userId)) {
      await Job.findByIdAndUpdate(id, {
        $pull: { savedUsers: userId },
        $inc: { saveCount: -1 },
      });

      await User.findByIdAndUpdate(userId, {
        $pull: { savedJobs: id }
      });

      return res.json({ message: "Job unsaved successfully" });
    }

    // Jika pekerjaan belum disimpan, tambahkan pekerjaan ke daftar savedUsers dan tambahkan saveCount
    await Job.findByIdAndUpdate(id, {
      $addToSet: { savedUsers: userId },  // Menggunakan $addToSet agar tidak ada duplikat
      $inc: { saveCount: 1 },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedJobs: id }
    });

    return res.json({ message: "Job saved successfully" });

  } catch (error) {
    // Log error ke console
    console.error("Error in saveJob:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ Mendapatkan daftar pekerjaan yang disimpan
const getSavedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ savedUsers: req.user.id })
      .populate("postedBy", "name email")
      .lean(); 

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving saved jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Fungsi untuk mengambil data dengan retry jika gagal dengan exponential backoff
const fetchJobsWithRetry = async (url, retries = 5, delay = 2000) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 429 || error.response.status === 503)
      ) {
        console.warn(`Rate limit hit! Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch jobs after multiple attempts.");
};

// ✅ Mengambil daftar pekerjaan dari API eksternal
const getExternalJobListings = async (req, res) => {
  console.log("🚀 External jobs route hit!");

  try {
    console.log("🛠 Query params diterima di backend:", req.query);
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

    const userLimit = parseInt(req.query.limit) || 10;
    const resultsPerPage = userLimit;
    const page = parseInt(req.query.page) || 1;

    const apiUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${app_id}&app_key=${app_key}&where=${encodeURIComponent(location)}${keyword}&results_per_page=${resultsPerPage}`;

    console.log("📌 Fetching from URL:", apiUrl);
    
    const jobData = await fetchJobsWithRetry(apiUrl);
    
    if (!jobData || !Array.isArray(jobData.results)) {
      console.log("⚠️ jobData.results tidak valid!");
      return res.json({ jobs: [], totalJobs: 0, totalPages: 0, currentPage: page });
    }

    console.log("🔍 Adzuna Job Data Fetched:", jobData.results.length);
    
    let newJobs = jobData.results.map((job) => ({
      externalId: job.id,
      title: job.title,
      company: job.company?.display_name || "Unknown Company",
      description: job.description || "No description available.",
      location: job.location?.display_name || "Unknown Location",
      contractType: job.contract_time
        ? job.contract_time.replace("_", "-").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : "Full-Time",
      workType: job.category?.label?.toLowerCase().includes("remote")
        ? "Remote"
        : job.category?.label?.toLowerCase().includes("hybrid")
        ? "Hybrid"
        : "Onsite",
    }));

    console.log("📌 Jobs Fetched from API:", newJobs.length);

    let savedJobs = await Job.find({
      externalId: { $in: newJobs.map((job) => job.externalId) },
    });
    let existingJobIds = new Set(savedJobs.map((job) => job.externalId));

    let jobsToInsert = newJobs.filter((job) => !existingJobIds.has(job.externalId));
    if (jobsToInsert.length > 0) {
      await Job.insertMany(jobsToInsert);
      console.log("✅ Jobs Inserted into DB:", jobsToInsert.length);
    }

    let finalJobs = [...savedJobs, ...jobsToInsert];

    if (contractTypeFilter) {
      finalJobs = finalJobs.filter((job) => job.contractType?.toLowerCase() === contractTypeFilter.toLowerCase());
    }
    if (workTypeFilter) {
      finalJobs = finalJobs.filter((job) => job.workType === workTypeFilter);
    }

    const totalFilteredJobs = jobData.count || 0;
    const totalPages = Math.ceil(totalFilteredJobs / userLimit);

    console.log("📌 Total Pages Calculated:", totalPages);
    console.log("📌 Jobs yang dikirim ke frontend:", finalJobs.length);

    res.json({
      jobs: finalJobs,
      totalJobs: totalFilteredJobs,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Error fetching and saving jobs:", error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

module.exports = {
  getUserJobList,
  createJob,
  updateJob,
  deleteJob,
  removeSavedJob,
  restoreJob,
  applyJob,
  getAppliedJobs,
  saveJob,
  getSavedJobs,
  getExternalJobListings,
};
