import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch jobs data
  const fetchJobs = async () => {
    try {
      // Mengambil token dan ID pengguna dari localStorage
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // Mengambil user sebagai objek
  
      console.log("Token:", token); 
      console.log("User:", user);
  
      if (!user || !user.id) {
        console.error("User ID is missing or not found");
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
  
      // Membuat konfigurasi header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Jika Anda menggunakan token JWT
        },
      };
  
      // Menyiapkan parameter request
      const params = {
        app_id: "b258b0a3",
        app_key: "63e9e6b82c2775f5e164d60d8fee0012",
        user_id: user.id, // Kirimkan ID pengguna sebagai parameter
        location: "remote", // Atau gunakan nilai yang sesuai
        job_type: "fulltime", // Atau gunakan nilai yang sesuai
      };
  
      console.log("Request Params:", params); // Menampilkan parameter request yang akan dikirim
  
      // Melakukan permintaan GET
      const response = await axios.get("http://localhost:5001/api/jobs", {
        params: params, // Mengirimkan semua parameter sekaligus
        ...config, // Menambahkan header ke konfigurasi
      });
  
      // Tangani response
      console.log("Jobs fetched:", response.data);
      setJobs(response.data); // Misalnya, menyimpan data pekerjaan ke state
      setLoading(false); // Menghentikan loading setelah data diterima
  
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to fetch jobs.");
      setLoading(false);
    }
  };
  
  

  // Call fetchJobs when component is mounted
  useEffect(() => {
    fetchJobs(); // Panggil fetchJobs hanya sekali saat komponen pertama kali di-mount
  }, []);  // Array kosong memastikan hanya dipanggil sekali saat komponen mount


const filteredJobs = Array.isArray(jobs) ? jobs.filter(
  (job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === "All" || job.contract_type === filterType)
) : [];

  console.log("Filtered Jobs: ", filteredJobs); // Debugging filtered jobs

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  console.log("Total Pages: ", totalPages); // Verifikasi jumlah halaman

  const startIndex = (currentPage - 1) * jobsPerPage;
  const selectedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  console.log("Selected Jobs: ", selectedJobs); // Verifikasi pekerjaan yang dipilih

  // Handling loading and error state
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <section id="jobs" className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Latest Job Openings
        </h2>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full md:w-1/2 p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="w-full md:w-1/4 p-2 border rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        {/* Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedJobs.length > 0 ? (
            selectedJobs.map((job) => {
              console.log("Rendering job: ", job); // Debugging log
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: job.id * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold text-blue-600">
                    {job.title || "Title not available"}
                  </h3>
                  <p className="text-gray-700">
                    {job.company?.display_name || "Company not listed"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.location?.display_name || "Location not available"} •{" "}
                    {job.contract_type || "Contract type not specified"}
                  </p>
                  <Link
                    to={`/job/${job.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No jobs found.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 mx-1 rounded ${
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
              className="px-4 py-2 mx-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
