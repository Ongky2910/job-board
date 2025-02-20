import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const BASE_URL = "http://localhost:5001/api";

const useJobs = (searchTerm = "", filterType = "All", currentPage = 1) => {
  const { user, setUser, isUserLoading, logoutUser } = useUser();
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

      // 🔹 Deklarasi awal variabel untuk menghindari ReferenceError
      let localJobsResponse = { data: { jobs: [], totalPages: 1 } };
      let externalJobsResponse = { data: [] };

      try {
        const params = {
          user_id: user.id,
          search: searchTerm.trim(),
          job_type: filterType === "All" ? "" : filterType,
          page: currentPage,
          limit: jobsPerPage,
        };

        console.log("Fetching jobs with params:", params);

        [localJobsResponse, externalJobsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/jobs`, {
            params,
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/jobs/external-jobs`, {
            params,
            withCredentials: true,
          }),
        ]);

        console.log("✅ Local Jobs Response:", localJobsResponse.data);
        console.log("✅ External Jobs Response:", externalJobsResponse.data);

        setJobs([
          ...(Array.isArray(localJobsResponse.data.jobs) ? localJobsResponse.data.jobs : []),
          ...(Array.isArray(externalJobsResponse.data) ? externalJobsResponse.data : []),
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
  }, [searchTerm, filterTypeState, currentPage, user, isUserLoading]);

  // 🔹 Pastikan `console.log` hanya dijalankan dalam `useEffect`
  // 🔹 Refresh Jobs
  const refreshJobs = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      console.log("🔄 Refreshing jobs...");
      const params = {
        user_id: user.id,
        search: searchTermState.trim(),
        job_type: filterTypeState === "All" ? "" : filterTypeState,
        page: currentPageState,
        limit: jobsPerPage,
      };

      const [localJobsResponse, externalJobsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/jobs`, { params, withCredentials: true }),
        axios.get(`${BASE_URL}/jobs/external-jobs`, { params, withCredentials: true }),
      ]);

      setJobs([
        ...(Array.isArray(localJobsResponse.data.jobs) ? localJobsResponse.data.jobs : []),
        ...(Array.isArray(externalJobsResponse.data) ? externalJobsResponse.data : []),
      ]);

      setTotalPages(localJobsResponse.data.totalPages || 1);
      console.log("✅ Jobs refreshed successfully!");
    } catch (err) {
      console.error("❌ Failed to refresh jobs:", err);
    }
  }, [user, searchTermState, filterTypeState, currentPageState]);

  // 🔹 Save Job
  const handleSaveJob = useCallback(async (jobId) => {
    if (!user) return alert("Please login to save jobs.");

    console.log(`🟢 Saving job with ID: ${jobId}`);

    try {
      const response = await axios.post(
        `${BASE_URL}/jobs/${jobId}/save`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("✅ Response from Save API:", response.data);
      alert(response.data.message || "Job saved successfully!");

      // ✅ Update User Data
      setUser((prev) => ({
        ...prev,
        jobSaved: (prev.jobSaved || 0) + 1,
      }));
    } catch (err) {
      console.error("❌ Failed to save job:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to save job.");
    }
  }, [user, setUser]);

  // 🔹 Apply Job
  const handleApplyJob = useCallback(async (jobId) => {
    if (!user) return alert("Please login to apply for jobs.");

    try {
      const response = await axios.post(
        `${BASE_URL}/jobs/${jobId}/apply`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status !== 200) throw new Error("Failed to apply job");

      // ✅ Update User Data
      setUser((prev) => ({
        ...prev,
        jobApplied: (prev.jobApplied || 0) + 1,
      }));

      console.log("✅ Job applied successfully!");
    } catch (error) {
      console.error("❌ Error applying for job:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to apply for job.");
    }
  }, [user, setUser]);

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
    setJobs,
    refreshJobs,
  };
};

export default useJobs;