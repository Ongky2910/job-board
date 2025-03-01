import { motion } from "framer-motion";
import useJobs from "../hooks/useJobs";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

const JobList = () => {
  const {
    jobs,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    currentPage,
    setCurrentPage,
    totalPages,
    handleApplyJob,
    handleSaveJob,
  } = useJobs();

  const filteredJobs = jobs;

  console.log("JobList rendered", { filteredJobs, isLoading, error });
  console.log("Fetched jobs:", jobs);

  return (
    <section id="jobs" className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Latest Job Openings
        </h2>

        {/* 🔹 Search & Filter */}
        <div className="flex justify-center gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs..."
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:text-gray-500"
          >
            <option value="All">All</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* 🔹 Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="text-center col-span-full">Search jobs...</div>
          ) : error ? (
            <div className="text-red-500 text-center col-span-full">
              {error}
            </div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job, index) => {
              console.log("Job Data:", job);

              return (
                <motion.div
                  key={job._id || job.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold text-blue-600">
                    {job.title || "No title available"}
                  </h3>
                  <p className="text-gray-700">
                    {job.company || "Company not specified"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.location || "Location not provided"} •{" "}
                    {job.contractType || "Unknown"}
                  </p>
                  <ToastContainer position="top-right" autoClose={3000} />

                  {/* 🔹 Apply & Save Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleApplyJob(job._id || job.id)}
                      className={`px-4 py-2 rounded text-sm font-semibold transition ${
                        job.isApplied
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                      disabled={job.isApplied}
                    >
                      {job.isApplied ? "Applied ✅" : "Apply"}
                    </button>

                    <button
                      onClick={() => handleSaveJob(job._id || job.id)}
                      className={`px-4 py-2 rounded text-sm font-semibold transition ${
                        job.isSaved
                          ? "bg-yellow-300 text-gray-800 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                      disabled={job.isSaved}
                    >
                      {job.isSaved ? "Saved ★" : "Save"}
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No jobs found.
            </p>
          )}
        </div>

        {/* 🔹 Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobList;
