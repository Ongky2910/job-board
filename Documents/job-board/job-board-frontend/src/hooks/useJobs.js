
import { useState, useEffect } from "react";
import axios from "axios";

const useJobs = () => {
  const [jobs, setJobs] = useState([]); // Menyimpan semua pekerjaan
  const [filteredJobs, setFilteredJobs] = useState([]); // Menyimpan pekerjaan yang difilter
  const [isLoading, setIsLoading] = useState(true); // Status loading

  useEffect(() => {
    // Ambil data pekerjaan dari API
    axios
      .get("/api/jobs") // Ganti dengan URL API yang sesuai
      .then((response) => {
        console.log("Jobs fetched:", response.data); 
        setJobs(response.data);
        setFilteredJobs(response.data); // Awalnya semua pekerjaan ditampilkan
        setIsLoading(false); // Ubah status loading setelah data selesai diambil
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setIsLoading(false); // Tetap ubah status loading ke false walaupun terjadi error
      });
  }, []); // useEffect hanya berjalan sekali saat komponen pertama kali dimuat

  // Fungsi untuk memfilter pekerjaan berdasarkan pencarian
  const filterJobs = (searchTerm) => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  return { jobs, filteredJobs, setFilteredJobs, isLoading, filterJobs };
};

export default useJobs;
