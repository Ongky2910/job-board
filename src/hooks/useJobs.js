import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import _ from "lodash";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/api";

const useJobs = () => {
  const { user, isUserLoading, logoutUser } = useUser();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 6;

  const [contractType, setContractType] = useState("All");
  const [workType, setWorkType] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobsAppliedCount, setJobsAppliedCount] = useState(0);
  const [jobsSavedCount, setJobsSavedCount] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]);

  const debouncedFetchRef = useRef();

  // ✅ Memoization untuk parameter request agar tidak berubah setiap render
  const fetchParams = useMemo(() => ({
    user_id: user?.id,
    search: searchTerm.trim(),
    job_type: filterType === "All" ? "" : filterType,
    contract_type: contractType === "All" ? "" : contractType,
    work_type: workType === "All" ? "" : workType,
    page: currentPage,
    limit: jobsPerPage,
  }), [user, searchTerm, filterType, contractType, workType, currentPage]);

  // ✅ Ambil jumlah pekerjaan yang telah disimpan & dilamar oleh user
  const fetchUserJobCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/dashboard`, {
        withCredentials: true,
      });
      setJobsAppliedCount(response.data.user.appliedJobs?.length || 0);
      setJobsSavedCount(response.data.user.savedJobs?.length || 0);
    } catch (error) {
      console.error("❌ Error fetching user job counts:", error);
    }
  }, [user?.id]);

  // ✅ Fungsi utama untuk mengambil data pekerjaan
  const fetchJobs = useCallback(async () => {
    if (!user?.id || isUserLoading) return;
    console.log("🔄 Fetching jobs with params:", fetchParams);

    setIsLoading(true);
    setError(null);

    try {
      const [localJobsResponse, externalJobsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/jobs`, { 
          params: fetchParams, 
          withCredentials: true,
          headers: { Authorization: `Bearer ${user?.token}` } // Tambahkan token
        }),
        axios.get(`${BASE_URL}/api/jobs/external-jobs`, { 
          params: fetchParams, 
          withCredentials: true,
          headers: { Authorization: `Bearer ${user?.token}` } // Tambahkan token
        }),
      ]);

      let allJobs = [
        ...(Array.isArray(localJobsResponse.data.jobs) ? localJobsResponse.data.jobs : []),
        ...(Array.isArray(externalJobsResponse.data.jobs) ? externalJobsResponse.data.jobs : []),
      ];

      console.log("✅ Jobs fetched:", allJobs.length);
      setJobs(allJobs);
      setTotalPages(localJobsResponse.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      if (err.response?.status === 401) {
        logoutUser();
      } else {
        setError(err.response?.data?.message || "Failed to fetch jobs.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isUserLoading]); 


  // ✅ Fungsi untuk menyimpan pekerjaan (Save Job)
  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.warning("⚠️ Please login to save jobs!", { autoClose: 3000 });
      return;
    }

    try {
      // Ambil daftar pekerjaan yang sudah disimpan dari backend (pastikan endpoint tersedia)
      const savedJobsResponse = await axios.get(`${BASE_URL}/api/jobs/saved`, {
        withCredentials: true,
      });

      const savedJobsList = savedJobsResponse.data; // Pastikan ini adalah array berisi jobId
      console.log("📌 Saved Jobs:", savedJobsList);

      const jobAlreadySaved = savedJobsList.some((job) => job.id === jobId);
      if (jobAlreadySaved) {
        toast.info("🔖 This job is already saved!", { autoClose: 3000 });
        return;
      }

      // Jika belum disimpan, lanjutkan menyimpan pekerjaan
      const response = await axios.post(
        `${BASE_URL}/api/jobs/${jobId}/save`,
        {},
        { withCredentials: true }
      );
      console.log("✅ Job saved successfully:", response.data);

      // Perbarui state untuk menampilkan status terbaru
      setSavedJobs([...savedJobsList, { id: jobId }]);
      toast.success("💾 Job saved successfully!", { autoClose: 3000 });
    } catch (error) {
      console.error("❌ Error saving job:", error);

      if (error.response) {
        if (error.response.status === 400) {
          toast.error(
            `⚠️ ${
              error.response.data.message || "You already saved this job."
            }`,
            { autoClose: 3000 }
          );
        } else {
          toast.error(
            `❌ Error: ${error.response.data.message || "Failed to save job."}`,
            { autoClose: 3000 }
          );
        }
      } else {
        toast.error("❌ Network error. Please try again.", { autoClose: 3000 });
      }
    }
  };

  // ✅ Fungsi untuk melamar pekerjaan (Apply Job)
  const handleApplyJob = async (jobId) => {
    if (!user) {
      toast.warning("⚠️ Please complete credentials to apply for jobs!");
      return;
    }

    const jobAlreadyApplied = jobs.find((job) => job.id === jobId)?.isApplied;
    if (jobAlreadyApplied) {
      toast.error("⚠️ You already applied for this job.", {
        autoClose: 3000,
        pauseOnHover: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/jobs/${jobId}/apply`,
        {},
        { withCredentials: true }
      );
      console.log("✅ Job applied successfully:", response.data);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, isApplied: true } : job
        )
      );
      toast.success("🎉 Job application submitted!");
    } catch (error) {
      console.error("❌ Error applying for job:", error);

      if (error.response) {
        if (error.response.status === 400) {
          toast.error(
            `⚠️ ${
              error.response.data.message || "You already applied for this job."
            }`
          );
        } else {
          toast.error(
            `❌ Error: ${
              error.response.data.message || "Failed to apply for job."
            }`
          );
        }
      } else {
        toast.error("❌ Network error. Please try again.");
      }
    }
  };

  // ✅ Atur debounce untuk fetch jobs
  useEffect(() => {
    if (!isUserLoading && user) {
      if (!debouncedFetchRef.current) {
        debouncedFetchRef.current = _.debounce(fetchJobs, 500);
      }
      debouncedFetchRef.current(); 
      fetchUserJobCounts();
    }
  }, [fetchJobs, fetchUserJobCounts, user, isUserLoading]);
  
  

  return {
    jobs,
    isLoading,
    error,
    totalPages,
    filterType,
    setFilterType,
    contractType,
    setContractType,
    workType,
    setWorkType,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    handleSaveJob,
    handleApplyJob,
    jobsAppliedCount,
    jobsSavedCount,
  };
};

export default useJobs;
