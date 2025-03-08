import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debounce } from "lodash";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001" 
    : "https://amused-liberation-production.up.railway.app"); 


const useJobs = () => {
  const { user, isUserLoading, logoutUser } = useUser();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 10;

  const [contractType, setContractType] = useState("All");
  const [workType, setWorkType] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobsAppliedCount, setJobsAppliedCount] = useState(0);
  const [jobsSavedCount, setJobsSavedCount] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);

  // ✅ Memoization untuk parameter request
  const fetchParams = useMemo(() => {
    const params = {
      user_id: user?.id,
      search: searchTerm.trim() || undefined,
      job_type: filterType !== "All" ? filterType : undefined,
      contract_type: contractType !== "All" ? contractType : undefined,
      work_type: workType !== "All" ? workType : undefined,
      page: currentPage,
      limit: jobsPerPage,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) delete params[key];
    });

    return params;
  }, [user, searchTerm, filterType, contractType, workType, currentPage]);

  // ✅ Fetch jumlah pekerjaan yang telah dilamar 
  const fetchAppliedJobs = useCallback(async () => {
    if (!user?.id) return;
  
    try {
      const response = await axios.get(`${BASE_URL}/api/jobs/applied`, {
        withCredentials: true,
      });
      console.log("Fetched applied jobs:", response.data);

      const fetchedAppliedJobs = response.data || [];
      setAppliedJobs(fetchedAppliedJobs);
  
      console.log("Fetched applied jobs:", fetchedAppliedJobs);
    } catch (error) {
      console.error("❌ Error fetching applied jobs:", error);
    }
  }, [user?.id]);
  
  const fetchUserJobCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const appliedJobsCount = appliedJobs.length; 
      const savedJobsCount = savedJobs.length || 0; 
  
      setJobsAppliedCount(appliedJobsCount);  
      setJobsSavedCount(savedJobsCount);
  
      console.log("✅ Updated jobsAppliedCount:", appliedJobsCount);
      console.log("✅ Updated jobsSavedCount:", savedJobsCount);
    } catch (error) {
      console.error("❌ Error fetching user job counts:", error);
    }
  }, [user?.id, appliedJobs, savedJobs]);  

  

  // ✅ Fetch pekerjaan yang sudah disimpan
  const fetchSavedJobs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/jobs/saved`, {
        withCredentials: true,
      });
      setSavedJobs(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching saved jobs:", error);
    }
  }, [user?.id]);
    
  // ✅ Fungsi utama untuk mengambil data pekerjaan
  const fetchJobs = useCallback(async () => {
    if (!user?.id || isUserLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const [localJobsResponse, externalJobsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/jobs`, {
          params: fetchParams,
          withCredentials: true,
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
        axios.get(`${BASE_URL}/api/jobs/external-jobs`, {
          params: fetchParams,
          withCredentials: true,
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
      ]);

      const totalJobsCount =
        (localJobsResponse.data.totalJobs || 0) +
        (externalJobsResponse.data.totalJobs || 0);

      let allJobs = [
        ...(Array.isArray(localJobsResponse.data.jobs)
          ? localJobsResponse.data.jobs
          : []),
        ...(Array.isArray(externalJobsResponse.data.jobs)
          ? externalJobsResponse.data.jobs
          : []),
      ];

      setJobs(allJobs);
      setTotalJobs(totalJobsCount);
      setTotalPages(Math.ceil(totalJobsCount / jobsPerPage));
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      if (err.response?.status === 401) logoutUser();
      else setError(err.response?.data?.message || "Failed to fetch jobs.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentPage, logoutUser]);

  // ✅ Debounced search agar tidak spam request API
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 500),
    []
  );

  // ✅ Reset filters ke default
  const resetFilters = () => {
    setFilterType("All");
    setContractType("All");
    setWorkType("All");
    setCurrentPage(1);
    setSearchTerm("");
  };

  // ✅ Simpan pekerjaan ke daftar favorit
const handleSaveJob = async (jobId) => {
  if (!user) {
    toast.warning("⚠️ Please login to save jobs!", { autoClose: 3000 });
    return;
  }

  try {
    await axios.post(
      `${BASE_URL}/api/jobs/${jobId}/save`,
      {},
      { withCredentials: true }
    );

    setSavedJobs((prevSavedJobs) => [...prevSavedJobs, { id: jobId }]);
    toast.success("💾 Job saved successfully!", { autoClose: 3000 });
  } catch (error) {
    console.error("❌ Error saving job:", error);
    toast.error("❌ Failed to save job. Please try again.");
  }
};

// ✅ Melamar pekerjaan
const handleApplyJob = async (jobId) => {
  if (!user) {
    toast.warning("⚠️ Please login to apply for jobs!", { autoClose: 3000 });
    return;
  }

  try {
    // Kirim request apply job
    await axios.post(`${BASE_URL}/api/jobs/${jobId}/apply`, {}, { withCredentials: true });

    // Update appliedJobs langsung
    setAppliedJobs((prevAppliedJobs) => {
      const updatedAppliedJobs = [...prevAppliedJobs, { _id: jobId }];
      console.log("Updated appliedJobs state:", updatedAppliedJobs); // ✅ Debug log
      return updatedAppliedJobs;
    });

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId || job.id === jobId ? { ...job, isApplied: true } : job
      )
    );

    // Call fetchAppliedJobs to get the latest applied jobs after applying for a job
    fetchAppliedJobs(); // Refresh applied jobs to make sure the count is accurate
    toast.success("📩 Successfully applied for the job!", { autoClose: 3000 });
  } catch (error) {
    console.error("❌ Error applying for job:", error);
    toast.error(`❌ Failed to apply: ${error.response?.data?.message || "Please try again."}`);
  }
};


  // ✅ Hapus pekerjaan dari daftar yang disimpan
  const handleRemoveSavedJob = async (jobId) => {
    if (!user) {
      toast.warning("⚠️ Please login to remove saved jobs!", { autoClose: 3000 });
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/jobs/${jobId}/unsave`, {
        withCredentials: true,
      });

      setSavedJobs((prevSavedJobs) =>
        prevSavedJobs.filter((job) => job.id !== jobId)
      );
      toast.success("🗑️ Job removed from saved list!", { autoClose: 3000 });
    } catch (error) {
      console.error("❌ Error removing saved job:", error);
      toast.error("❌ Failed to remove job. Please try again.");
    }
  };

  // ✅ Efek samping untuk fetch data saat ada perubahan user atau filter
  useEffect(() => {
    if (!isUserLoading && user?.id) {
      fetchJobs();
      fetchAppliedJobs();  
      fetchSavedJobs();  
    }
  }, [user?.id, currentPage, fetchJobs, fetchAppliedJobs, fetchSavedJobs, isUserLoading]);
  
  useEffect(() => {
    setJobsAppliedCount(appliedJobs.length);  
  }, [appliedJobs]); 

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
    setSearchTerm: debouncedSearch,
    currentPage,
    setCurrentPage,
    handleSaveJob,
    handleApplyJob,
    handleRemoveSavedJob,
    resetFilters,
    jobsAppliedCount,
    jobsSavedCount,
    savedJobs,
    fetchJobs,
  };
};

export default useJobs;
