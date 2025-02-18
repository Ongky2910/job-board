import { createContext, useContext, useState, useEffect } from "react";

// Membuat Context untuk User
const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State untuk pengguna
  const [appliedJobs, setAppliedJobs] = useState([]); // State untuk pekerjaan yang dilamar

  // Load user dari localStorage saat pertama kali aplikasi dibuka
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedJobs = localStorage.getItem("appliedJobs");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // Memuat user dari localStorage
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }

    if (storedJobs) {
      try {
        setAppliedJobs(JSON.parse(storedJobs)); // Memuat pekerjaan yang dilamar dari localStorage
      } catch (error) {
        console.error("Error parsing applied jobs:", error);
        localStorage.removeItem("appliedJobs");
      }
    }
  }, []);

  // Fungsi untuk login dan menyimpan data pengguna
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Menyimpan data pengguna ke localStorage
  };

  // Fungsi untuk logout dan menghapus data pengguna
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user"); // Menghapus data pengguna dari localStorage
  };

  // Fungsi untuk menambah pekerjaan yang dilamar
  const addAppliedJob = (job) => {
    setAppliedJobs((prevJobs) => {
      const updatedJobs = [...prevJobs, job];
      localStorage.setItem("appliedJobs", JSON.stringify(updatedJobs)); // Menyimpan daftar pekerjaan yang dilamar ke localStorage

      // Update state user agar data pekerjaan yang dilamar ada di dalam user
      setUser((prevUser) => ({
        ...prevUser,
        appliedJobs: updatedJobs,
      }));

      return updatedJobs;
    });
  };

  // Fungsi untuk menghapus pekerjaan yang dilamar
  const removeAppliedJob = (jobId) => {
    const updatedJobs = appliedJobs.filter((job) => job.id !== jobId);
    setAppliedJobs(updatedJobs);
    localStorage.setItem("appliedJobs", JSON.stringify(updatedJobs)); // Menyimpan daftar pekerjaan yang dilamar setelah dihapus

    // Update state user agar data pekerjaan yang dilamar ada di dalam user
    setUser((prevUser) => ({
      ...prevUser,
      appliedJobs: updatedJobs,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        user, 
        setUser, 
        loginUser, 
        logoutUser, 
        appliedJobs, 
        addAppliedJob, 
        removeAppliedJob
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
