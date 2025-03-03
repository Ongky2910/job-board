import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import useJobs from "../hooks/useJobs";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser() ?? { user: null, setUser: () => {} };
  const { jobs = [], setJobs = () => {} } = useJobs() ?? {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Ambil user dari localStorage saat pertama kali halaman dimuat
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate("/login");
      return; 
    }
  }, [setUser, navigate]);
  

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, jobsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/auth/dashboard`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/jobs`, {
            withCredentials: true,
          }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.data?.user) {
          const userInfo = userRes.value.data.user;
          setUserData({
            name: userInfo.name ?? "N/A",
            email: userInfo.email ?? "N/A",
            jobApplied: Array.isArray(userInfo.appliedJobs) ? userInfo.appliedJobs.length : 0,
            jobSaved: Array.isArray(userInfo.savedJobs) ? userInfo.savedJobs.length : 0,
          });
        } else {
          console.warn("User data invalid:", userRes);
          navigate("/login");
        }
        

        if (
          jobsRes.status === "fulfilled" &&
          Array.isArray(jobsRes.value.data)
        ) {
          console.log("✅ Jobs from API:", jobsRes.value.data);
          setJobs([...jobsRes.value.data]);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        navigate("/login"); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, navigate, setJobs]);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

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

  if (!userData) return <div>No user data found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {userData.name}</h1>
        <input
          type="text"
          placeholder="Search jobs..."
          className="p-2 border rounded w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredJobs.map((job) => (
          <li
            key={job.id}
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
          >
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p>{job.company}</p>
          </li>
        ))}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Jobs Applied</h3>
              <p className="text-xl">{userData.jobApplied}</p>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Jobs Saved</h3>
              <p className="text-xl">{userData.jobSaved}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Account Email</h3>
              <p className="text-xl">{userData.email}</p>
            </div>
          </div>
        </div>

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
                  <Link
                    to={`/jobs/${job.id || job._id}`}
                    className="text-blue-500"
                  >
                    View Job
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
