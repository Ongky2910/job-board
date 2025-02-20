import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const BASE_URL = "http://localhost:5001/api";

const useJobs = (searchTerm = "", filterType = "All", currentPage = 1) => {
  const { user, isUserLoading, logoutUser } = useUser(); 
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 6;
  const [searchTermState, setSearchTerm] = useState(searchTerm);
  const [filterTypeState, setFilterType] = useState(filterType);
  const [currentPageState, setCurrentPage] = useState(currentPage);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || !user.id) {
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = {
          user_id: user.id,
          search: searchTerm.trim(),
          job_type: filterType === "All" ? "" : filterType,
          page: currentPage,
          limit: jobsPerPage,
        };

        const [localJobsResponse, externalJobsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/jobs`, {
            params,
            withCredentials: true, 
          }),
          axios.get(`${BASE_URL}/jobs/external-jobs`, {
            params,
            withCredentials: true, 
          }),
        ]);

        setJobs([
          ...(Array.isArray(localJobsResponse.data.jobs) ? localJobsResponse.data.jobs : []),
          ...(Array.isArray(externalJobsResponse.data.results) ? externalJobsResponse.data.results : []),
        ]);

        setTotalPages(localJobsResponse.data.totalPages || 1);
      } catch (err) {
        console.error("❌ Error occurred:", err);

        if (err.response?.status === 401) {
          console.warn("⚠️ Token expired, logging out...");
          logoutUser();
        } else {
          setError(err.response?.data?.message || "Failed to fetch jobs.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchTerm, filterType, currentPage, user, isUserLoading]);

  // 🔹 Fungsi untuk menyimpan pekerjaan
  const handleSaveJob = async (jobId) => {
    try {
      console.log("Saving job at:", `${BASE_URL}/jobs/${jobId}/save`);
      const response = await axios.post(
        `${BASE_URL}/jobs/${jobId}/save`,
        { jobId },
        { withCredentials: true }
      );
      alert(response.data.message || "Job saved successfully!");
    } catch (err) {
      console.error("Failed to save job:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to save job.");
    }
  };

  // 🔹 Fungsi untuk melamar pekerjaan
  const handleApplyJob = async (jobId) => {
    try {
      console.log("Applying for job at:", `${BASE_URL}/jobs/${jobId}/apply`);
      const response = await axios.post(
        `${BASE_URL}/jobs/${jobId}/apply`,
        { jobId },
        { withCredentials: true }
      );
      alert(response.data.message || "Applied successfully!");
    } catch (err) {
      console.error("Failed to apply for job:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to apply for job.");
    }
  };

  return {
    jobs,
    isLoading,
    error,
    totalPages,
    searchTerm: searchTermState,
    setSearchTerm,
    filterType: filterTypeState,
    setFilterType,
    currentPage: currentPageState,
    setCurrentPage,
    handleSaveJob,
    handleApplyJob,
  };
};

export default useJobs;
