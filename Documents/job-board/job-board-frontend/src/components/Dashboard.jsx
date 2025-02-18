import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; // Import context user
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useUser(); // Ambil data user dari context
  const [userData, setUserData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    if (user) {
      // Ambil pekerjaan yang dilamar dari localStorage
      const jobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
      setAppliedJobs(jobs);

      // Ambil data user yang lebih lengkap
      setUserData({
        name: user.name,
        email: user.email,
        jobApplied: jobs.length,
        jobSaved: user.savedJobs?.length || 0, // Pastikan savedJobs ada
        appliedJobs: jobs,
      });
    }
  }, [user]);

  if (!userData) {
    return <div>Loading...</div>; // Tampilkan loading sementara data user diambil
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {userData?.name}</h1>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Jobs Applied</h3>
              <p className="text-xl">{userData?.jobApplied}</p>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Jobs Saved</h3>
              <p className="text-xl">{userData?.jobSaved}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Account Email</h3>
              <p className="text-xl">{userData?.email}</p>
            </div>
          </div>
        </div>

         <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Applied Jobs</h2>
          {userData?.appliedJobs.length > 0 ? (
            <ul className="space-y-4">
              {userData?.appliedJobs.map((job, index) => (
                <li key={index} className="bg-gray-200 p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p>{job.company}</p>
                  <p>Applied on: {job.dateApplied}</p> {/* Tampilkan tanggal aplikasi */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No jobs applied yet.</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <Link
              to="/jobs"
              className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
            >
              View Jobs
            </Link>
            <Link
              to="/saved-jobs"
              className="bg-green-600 text-white py-2 px-6 rounded-full hover:bg-green-700 transition duration-300"
            >
              View Saved Jobs
            </Link>
            <Link
              to="/profile/edit"
              className="bg-gray-600 text-white py-2 px-6 rounded-full hover:bg-gray-700 transition duration-300"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
