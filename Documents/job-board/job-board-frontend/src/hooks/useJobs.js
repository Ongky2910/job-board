import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import _ from "lodash";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/api";
console.log("✅ BASE_URL:", BASE_URL);



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

  // Load counts from localStorage on initial render
  useEffect(() => {
    const savedAppliedCount = localStorage.getItem('jobsAppliedCount');
    const savedSavedCount = localStorage.getItem('jobsSavedCount');
    
    if (savedAppliedCount) setJobsAppliedCount(parseInt(savedAppliedCount));
    if (savedSavedCount) setJobsSavedCount(parseInt(savedSavedCount));
  }, []);

  const fetchUserJobCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/dashboard`, { withCredentials: true });
      console.log("📊 Dashboard data:", response.data);
      if (response.data?.user) {
        const appliedCount = response.data.user.appliedJobs?.length || 0;
        const savedCount = response.data.user.savedJobs?.length || 0;
        
        setJobsAppliedCount(appliedCount);
        setJobsSavedCount(savedCount);
        
        // Store in localStorage for persistence
        localStorage.setItem('jobsAppliedCount', appliedCount);
        localStorage.setItem('jobsSavedCount', savedCount);
      }
    } catch (error) {
      console.error("❌ Error fetching user job counts:", error);
    }
  }, [user]);

  const fetchJobs = useCallback(async () => {
    if (!user?.id || isUserLoading) return;
    setIsLoading(true);
    setError(null);
    console.log("🔄 Fetching jobs...", { user, isUserLoading });

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

      const [localJobsResponse, externalJobsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/jobs`, { params, withCredentials: true }),
        axios.get(`${BASE_URL}/jobs/external-jobs`, { params, withCredentials: true }),
      ]);

      let allJobs = [
        ...(Array.isArray(localJobsResponse.data.jobs) ? localJobsResponse.data.jobs : []),
        ...(Array.isArray(externalJobsResponse.data) ? externalJobsResponse.data : []),
      ];

      setJobs(allJobs);
      setTotalPages(localJobsResponse.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Error occurred:", err);
      if (err.response?.status === 401) {
        console.warn("⚠️ User unauthorized, logging out...");
        logoutUser();
      } else {
        setError(err.response?.data?.message || "Failed to fetch jobs.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoading, searchTerm, filterType, contractType, workType, currentPage, logoutUser]);

  const debouncedFetchJobs = useRef(_.debounce(fetchJobs, 500));

  useEffect(() => {
    if (!isUserLoading && user) {
      debouncedFetchJobs.current();
      fetchUserJobCounts();
    }
  }, [fetchJobs, fetchUserJobCounts, isUserLoading, user]);  // Added missing dependencies

  const handleSaveJob = async (jobId) => {
    if (!user) return;
    console.log("Saving for job:", jobId); 

    try {
      await axios.post(`${BASE_URL}/jobs/${jobId}/save`, {}, { withCredentials: true });
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId || job._id === jobId ? { ...job, isSaved: true } : job)));
      
      // Update count immediately and persist
      const newCount = jobsSavedCount + 1;
      setJobsSavedCount(newCount);
      localStorage.setItem('jobsSavedCount', newCount);
    } catch (error) {
      console.error("❌ Error saving job:", error);
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!user) return;
    console.log("Applying for job:", jobId); 

    try {
      await axios.post(`${BASE_URL}/jobs/${jobId}/apply`, {}, { withCredentials: true });
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId || job._id === jobId ? { ...job, isApplied: true } : job)));
      
      // Update count immediately and persist
      const newCount = jobsAppliedCount + 1;
      setJobsAppliedCount(newCount);
      localStorage.setItem('jobsAppliedCount', newCount);
    } catch (error) {
      console.error("❌ Error applying for job:", error);
    }
  };

  return {
    jobs,
    setJobs,
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
    isUserLoading,
    handleSaveJob,
    handleApplyJob,
    jobsAppliedCount,
    jobsSavedCount,
  };
};

export default useJobs;