import React, { useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import useJobs from "../hooks/useJobs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

axios.defaults.withCredentials = true;

export default function Dashboard({ user: memoizedUser }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user, shallowEqual);
  const isUserLoading = useSelector((state) => state.user.loading);
  const isPersisted = useSelector(
    (state) => state._persist?.rehydrated ?? false
  );

  const { jobs = [], setJobs, handleUnapplyJob } = useJobs() ?? {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);
  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

    console.log("Redux state user (dari useSelector):", user);

  const openJobDetail = (job) => {
    setSelectedJob(job);
  };

  const closeJobDetail = () => {
    setSelectedJob(null);
  };

  useEffect(() => {
    console.log("🔥 useEffect terpanggil!");
    console.log("isUserLoading:", isUserLoading);
    console.log("Redux state user:", user);
    console.log("user?.id:", user?.id);
    console.log("isPersisted:", isPersisted);
  
    if (isUserLoading) return;
  
    if (!user?.id) {
      console.log("🔄 User belum login, navigasi ke login...");
      navigate("/login");
      return;
    }
  
    const fetchData = async () => {
      setLoading(true);
      console.log("✅ Fetching dashboard data...");
      try {
        const userRes = await axios.get(`${API_BASE_URL}/api/auth/dashboard`, {
          withCredentials: true,
        });
  
        if (userRes?.data?.user) {
          setUserData(userRes.data.user);
          setSavedJobs(userRes.data.user.savedJobs ?? []);
          setAppliedJobs(userRes.data.user.appliedJobs ?? []);
        }
      } catch (error) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user?.id, isUserLoading, isPersisted, navigate]); 

  const removeSavedJob = async (id) => {
    console.log("Job ID:", id);
    if (!id) {
      toast.error("Invalid job ID");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/jobs/saved/${id}`, {
        withCredentials: true,
      });
      setSavedJobs((prev) => prev.filter((job) => job._id !== id));
      toast.success("Job removed from saved!");
    } catch (error) {
      console.error("Error removing job:", error);
      toast.error("Failed to remove job. Please try again.");
    }
  };

  console.log("Redux User State:", user);
  console.log("Redux Persist State:", isPersisted);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Welcome, {userData?.name || "Guest"}! 🚀
        </h1>
        {error && (
          <div className="bg-red-500 text-white p-4 mb-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-500 text-white rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold">Jobs Applied</h3>
            <p className="text-3xl font-bold">{appliedJobs.length}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-500 text-white rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold">Jobs Saved</h3>
            <p className="text-3xl font-bold">{savedJobs.length}</p>
          </motion.div>
        </div>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Your Applied Jobs</h2>
        {appliedJobs.length ? (
          <ul className="space-y-4">
            {appliedJobs.map((job) => (
              <motion.li
                whileHover={{ scale: 1.02 }}
                key={job._id}
                className="flex justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {job.company}
                  </p>
                </div>
                <button
                  onClick={() => handleUnapplyJob(job._id)}
                  className="text-red-500 hover:text-red-700 bg-transparent dark:bg-transparent dark:text-red-500 dark:hover:text-red-800 ml-4"
                >
                  <Trash2 size={20} />
                </button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No applied jobs yet.</p>
        )}

        <h2 className="text-2xl font-semibold mt-8 mb-4">Saved Jobs</h2>
        {savedJobs.length ? (
          <ul className="space-y-4">
            {savedJobs.map((job) => (
              <motion.li
                whileHover={{ scale: 1.02 }}
                key={job.id}
                className="flex justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {job.company}
                  </p>
                </div>
                <button
                  onClick={() => removeSavedJob(job._id)}
                  className="text-red-500 hover:text-red-700 bg-transparent dark:bg-transparent dark:text-red-500 dark:hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No saved jobs yet.</p>
        )}
      </div>
    </div>
  );
}
