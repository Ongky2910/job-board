import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import useJobs from "../hooks/useJobs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.withCredentials = true;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshToken, isLoading: isUserLoading } = useUser() ?? { user: null, isLoading: true };
  const { jobs = [], setJobs, handleApplyJob } = useJobs() ?? {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    if (isUserLoading || !user?.id) return;
  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          accessToken = await refreshToken();
          if (!accessToken) {
            navigate("/login");
            return;
          }
        }
  
        const userRes = await axios.get(`${API_BASE_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
  
        if (userRes?.data?.user) {
          setUserData(userRes.data.user);
          setSavedJobs(userRes.data.user.savedJobs ?? []);
          setAppliedJobs(userRes.data.user.appliedJobs ?? []);
        
          // Cek tipe dan panjang appliedJobs
          console.log("Applied Jobs Type:", Array.isArray(userRes.data.user.appliedJobs)); // Harusnya true
          console.log("Applied Jobs Length:", userRes.data.user.appliedJobs?.length); // Harusnya 12
          
          // Log Applied Jobs data
          console.log("Fetched applied jobs:", userRes.data.user.appliedJobs); // Cek data yang di-fetch
        }
        
  
        const jobsRes = await axios.get(`${API_BASE_URL}/api/jobs`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { user_id: userRes.data.user.id },
          withCredentials: true,
        });
        if (Array.isArray(jobsRes.data)) {
          setJobs(jobsRes.data);
        }
      } catch (error) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user?.id, isUserLoading]);
  

  const removeSavedJob = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/jobs/saved/${id}`, {
        withCredentials: true,
      });
      setSavedJobs((prev) => prev.filter((job) => job.id !== id));
      toast.success("Job removed from saved!");
    } catch {
      toast.error("Failed to remove job. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {userData?.name || "Guest"}! 🚀</h1>
        {error && <div className="bg-red-500 text-white p-4 mb-4 rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-blue-500 text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold">Jobs Applied</h3>
            <p className="text-xl">{appliedJobs.length}</p>
          </div>
          <div className="bg-green-500 text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold">Jobs Saved</h3>
            <p className="text-xl">{savedJobs.length}</p>
          </div>
        </div>

        {/* Applied Jobs */}
        <h2 className="text-2xl font-semibold mt-8">Your Applied Jobs</h2>
        {appliedJobs.length ? (
          <ul className="space-y-4">
            {appliedJobs.map((job) => (
              <li key={job.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p>{job.company}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No applied jobs yet.</p>
        )}

        {/* Saved Jobs */}
        <h2 className="text-2xl font-semibold mt-8">Saved Jobs</h2>
        {savedJobs.length ? (
          <ul className="space-y-4">
            {savedJobs.map((job) => (
              <li key={job.id} className="flex justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p>{job.company}</p>
                </div>
                <button onClick={() => removeSavedJob(job.id)} className="text-red-500">
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No saved jobs yet.</p>
        )}
      </div>
    </div>
  );
}
