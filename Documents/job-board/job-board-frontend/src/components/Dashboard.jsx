import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useUser() || {};
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedJobs = localStorage.getItem("appliedJobs");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const appliedJobs = storedJobs ? JSON.parse(storedJobs) : [];
        setUserData({
          name: userData?.name || "Unknown",
          email: userData?.email || "No email",
          jobApplied: appliedJobs.length,
          jobSaved: userData?.savedJobs?.length || 0,
          appliedJobs,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user" && !event.newValue) {
        setUserData(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!userData) return <div>Loading...</div>;

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
              <p className="text-xl">{userData.jobSaved}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-4">
              <h3 className="text-lg font-semibold">Account Email</h3>
              <p className="text-xl">{userData.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
