import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import useJobs from "../hooks/useJobs";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2 } from "lucide-react";

axios.defaults.withCredentials = true;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshToken, isLoading: isUserLoading } = useUser() ?? { user: null, isLoading: true };
  const { jobs = [], setJobs = () => {} } = useJobs() ?? {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    if (isUserLoading) return;

    if (!user?.id) {
      console.warn("🔴 No user found, redirecting to login...");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          console.warn("⚠️ Token expired, trying to refresh...");
          accessToken = await refreshToken();
        }

        if (!accessToken) {
          console.error("❌ No valid token found, redirecting to login...");
          navigate("/login");
          return;
        }

        const [userRes, jobsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/auth/dashboard`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/jobs`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.data?.user) {
          setUserData(userRes.value.data.user);
          setSavedJobs(userRes.value.data.user.savedJobs ?? []);
        } else {
          console.warn("User data invalid, trying to refresh token...");
          await refreshToken();
        }

        if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
          setJobs([...jobsRes.value.data]);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isUserLoading, navigate, setJobs, refreshToken]);

  const removeSavedJob = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/jobs/saved/${id}`, { withCredentials: true });
      const updatedJobs = savedJobs.filter((job) => job.id !== id);
      setSavedJobs(updatedJobs);
    } catch (error) {
      console.error("❌ Error removing saved job:", error);
      setError("Failed to remove saved job.");
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

  if (!userData) return <div>No user data found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {userData.name}</h1>

        {error && (
          <div className="bg-red-500 text-white p-4 mb-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}

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
                <li key={job.id || job._id || index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
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
                <div key={job.id} className="border-b p-4 rounded-lg shadow-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center">
                  <Link to={`/job/${job.id}`} className="flex-1 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
                  </Link>

                  <button onClick={() => removeSavedJob(job.id)} className="text-red-500 hover:text-red-600 transition ml-3">
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
