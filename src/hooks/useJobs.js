import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import _ from "lodash";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/api";

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

  const debouncedFetchRef = useRef();

  // ✅ Ambil jumlah pekerjaan yang telah disimpan & dilamar oleh user
  const fetchUserJobCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/auth/dashboard`, {
        withCredentials: true,
      });
      console.log("📊 Dashboard data:", response.data);
      if (response.data?.user) {
        setJobsAppliedCount(response.data.user.appliedJobs?.length || 0);
        setJobsSavedCount(response.data.user.savedJobs?.length || 0);
      }
    } catch (error) {
      console.error("❌ Error fetching user job counts:", error);
    }
  }, [user]);

  // ✅ Fungsi utama untuk mengambil data pekerjaan
  const fetchJobs = useCallback(async () => {
    if (!user?.id || isUserLoading) return;

    console.log("🔄 Fetching jobs...");
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        user_id: user.id,
        search: searchTerm.trim(),
        job_type: filterType === "All" ? "" : filterType,
        contract_type: contractType === "All" ? "" : contractType,
        work_type: workType === "All" ? "" : workType,
        page: currentPage,
        limit: jobsPerPage,
      };

      console.log("Fetching jobs with params:", params);

      const [localJobsResponse, externalJobsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/jobs`, { params, withCredentials: true }),
        axios.get(`${BASE_URL}/api/jobs/external-jobs`, {
          params,
          withCredentials: true,
        }),
      ]);

      let allJobs = [
        ...(Array.isArray(localJobsResponse.data.jobs)
          ? localJobsResponse.data.jobs
          : []),
        ...(Array.isArray(externalJobsResponse.data)
          ? externalJobsResponse.data
          : []),
      ];

      // 🔍 Pastikan hasil pencarian berfungsi dengan baik
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.trim().toLowerCase();
        allJobs = allJobs.filter(
          (job) =>
            job.title?.toLowerCase().includes(lowerSearch) ||
            job.company?.display_name?.toLowerCase().includes(lowerSearch) ||
            job.company_name?.toLowerCase().includes(lowerSearch)
        );
      }

      if (workType !== "All") {
        allJobs = allJobs.filter(
          (job) => job.work_type?.toLowerCase() === workType.toLowerCase()
        );
      }

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
  }, [user, isUserLoading, searchTerm, filterType, contractType, workType, currentPage]);

  // ✅ Fungsi untuk menyimpan pekerjaan (Save Job)
  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.warning("⚠️ Please login to save jobs!");
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/api/jobs/${jobId}/save`,
        {},
        { withCredentials: true }
      );
      console.log("✅ Job saved successfully:", response.data);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, isSaved: true } : job
        )
      );
      toast.success("✅ Job saved successfully!");
    } catch (error) {
      console.error("❌ Error saving job:", error);
      toast.error("❌ Failed to save job.");
    }
  };

  // ✅ Fungsi untuk melamar pekerjaan (Apply Job)
  const handleApplyJob = async (jobId) => {
    if (!user) {
      toast.warning("⚠️ Please complete credentials to apply for jobs!");
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
      toast.error("❌ Failed to apply for job.");
    }
  };

  // ✅ Atur debounce untuk fetch jobs
  useEffect(() => {
    debouncedFetchRef.current = _.debounce(fetchJobs, 500);
  }, [fetchJobs]);

  // ✅ Pastikan data pekerjaan di-fetch saat pertama kali
  useEffect(() => {
    if (!isUserLoading && user) {
      fetchJobs(); // panggil langsung untuk memastikan data muncul pertama kali
      debouncedFetchRef.current(); // gunakan debounce untuk perubahan state
      fetchUserJobCounts();
    }
  }, [fetchJobs, fetchUserJobCounts]);

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
