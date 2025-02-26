import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import useJobs from "../hooks/useJobs";
import { Link } from "react-router-dom";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser() ?? { user: null };
  const { jobs = [], setJobs = () => {} } = useJobs() ?? {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, jobsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/auth/dashboard`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/jobs`, {
            withCredentials: true,
          }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.data) {
          console.log("📌 User Data from API:", userRes.value.data);
          const userInfo = userRes.value.data.user || {};
          setUserData({
            name: userInfo.name || "N/A",
            email: userInfo.email || "N/A",
            jobApplied: userInfo.appliedJobs ? userInfo.appliedJobs.length : 0,
            jobSaved: userInfo.savedJobs ? userInfo.savedJobs.length : 0,
          });
        }

        if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
          console.log("✅ Jobs from API:", jobsRes.value.data);
          setJobs([...jobsRes.value.data]);
        }

        // Fetch saved jobs from localStorage
        const storedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
        setSavedJobs(storedJobs);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const removeSavedJob = (id) => {
    const updatedJobs = savedJobs.filter((job) => job.id !== id);
    setSavedJobs(updatedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(updatedJobs));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!userData) return <div>No user data found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {userData.name}</h1>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Jobs Applied</h3>
              <p className="text-xl">{userData.jobApplied}</p>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Jobs Saved</h3>
              <p className="text-xl">{savedJobs.length}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Account Email</h3>
              <p className="text-xl">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Your Jobs Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Jobs</h2>
          {Array.isArray(jobs) && jobs.length > 0 ? (
            <ul className="space-y-4">
              {jobs.map((job, index) => (
                <li
                  key={job.id || job._id || index}
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p>{job.company}</p>
                  <Link to={`/jobs/${job.id || job._id}`} className="text-blue-500">
                    View Job
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No jobs found.</p>
          )}
        </div>

        {/* Saved Jobs Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <p className="text-gray-500">No saved jobs yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border-b p-4 rounded-lg shadow-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center"
                >
                  <Link to={`/job/${job.id}`} className="flex-1 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {job.location} • {job.type}
                    </p>
                  </Link>

                  {/* Tombol Apply */}
                  <Link to={`/job/${job.id}?apply=true`}>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                      Apply Now
                    </button>
                  </Link>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => removeSavedJob(job.id)}
                    className="text-red-500 hover:text-red-600 transition ml-3"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
