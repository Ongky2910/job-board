import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import _ from "lodash";

const BASE_URL = "http://localhost:5001/api";

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

  const debouncedFetchRef = useRef(_.debounce(fetchJobs, 500));

  const fetchUserJobCounts = async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/auth/dashboard`, { withCredentials: true });
      console.log("📊 Dashboard data:", response.data);
      if (response.data?.user) {
        setJobsAppliedCount(response.data.user.appliedJobs?.length || 0);
        setJobsSavedCount(response.data.user.savedJobs?.length || 0);
      }
    } catch (error) {
      console.error("❌ Error fetching user job counts:", error);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!user) return;
    try {
      await axios.post(`${BASE_URL}/jobs/${jobId}/save`, {}, { withCredentials: true });
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId || job._id === jobId ? { ...job, isSaved: true } : job)));
    } catch (error) {
      console.error("❌ Error saving job:", error);
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!user) return;
    try {
      await axios.post(`${BASE_URL}/jobs/${jobId}/apply`, {}, { withCredentials: true });
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId || job._id === jobId ? { ...job, isApplied: true } : job)));
    } catch (error) {
      console.error("❌ Error applying for job:", error);
    }
  };

  const fetchJobs = async () => {
    if (!user?.id || isUserLoading) return;
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
      if (err.response?.status === 401) logoutUser();
      else setError(err.response?.data?.message || "Failed to fetch jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    debouncedFetchRef.current = _.debounce(fetchJobs, 500);
  }, []);

  useEffect(() => {
    if (!isUserLoading && user) {
      debouncedFetchRef.current();
      fetchUserJobCounts();
    }
  }, [searchTerm, user]);

  useEffect(() => {
    if (!isUserLoading && user) {
      console.log("🔄 Fetching jobs on page change:", currentPage);
      fetchJobs();
      fetchUserJobCounts();
    }
  }, [filterType, contractType, workType, currentPage, user, isUserLoading]);

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
