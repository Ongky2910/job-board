import { motion } from "framer-motion";
import useJobs from "../hooks/useJobs";
import { useEffect, useState } from "react";
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
    contractType,
    setContractType,
    workType,
    setWorkType,
    currentPage,
    setCurrentPage,
    totalPages,
    handleApplyJob,
    handleSaveJob,
  } = useJobs();

  // Debug external jobs - check if they're coming through
  const [localJobs, externalJobs] = useState([], []);
  
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      // Separate local and external jobs for debugging
      const local = jobs.filter(job => job._id); // Assuming local jobs have _id
      const external = jobs.filter(job => !job._id && job.id); // External jobs likely have id but not _id
      
      console.log("Local jobs count:", local.length);
      console.log("External jobs count:", external.length);
      
      setLocalJobs(local);
      setExternalJobs(external);
    }
  }, [jobs]);

  // Add a more detailed search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching with:", {
      searchTerm,
      filterType,
      contractType,
      workType,
      currentPage
    });
    // The useJobs hook should handle the actual search
  };

  return (
    <section id="jobs" className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Latest Job Openings
        </h2>

        {/* 🔹 Search & Filter - Enhanced */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
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
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:text-gray-500"
            >
              <option value="All">All Contract Types</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
            </select>
            
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:text-gray-500"
            >
              <option value="All">All Work Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          
          <div className="flex justify-center">
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* Debug info for development */}
        <div className="text-sm text-gray-500 mb-4 text-center">
          Showing {jobs?.length || 0} jobs 
          ({localJobs?.length || 0} local, {externalJobs?.length || 0} external)
        </div>

        {/* 🔹 Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="text-center col-span-full">Loading jobs...</div>
          ) : error ? (
            <div className="text-red-500 text-center col-span-full">
              {error}
            </div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job, index) => (
              <motion.div
                key={job._id || job.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition dark:bg-gray-700 dark:text-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {job.title || "No title available"}
                  </h3>
                  {/* Source tag - shows whether job is from API or local */}
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                    {job._id ? "Local" : "External"}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300">
                  {job.company || "Company not specified"}
                </p>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {job.location || "Location not provided"} •{" "}
                  {job.contractType || job.contract_type || "Unknown"}
                </p>
                
                {job.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                    {job.description}
                  </p>
                )}

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
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-300 col-span-full">
              No jobs found. Try adjusting your search filters.
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