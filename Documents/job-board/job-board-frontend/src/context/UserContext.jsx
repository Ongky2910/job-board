import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  // ✅ Cek autentikasi saat aplikasi pertama kali dijalankan
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    checkAuth(); // Cek ulang autentikasi saat aplikasi dimulai
  }, []);

  // ✅ Fungsi untuk mengecek user saat pertama kali load
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking user authentication...");
      const response = await axios.get(`${API_URL}/api/auth/verify-token`, {
        withCredentials: true,
      });

      console.log("✅ User authenticated:", response.data);

      if (response.data.user) {                                     
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(
        "❌ Error checking auth:",
        error.response?.data || error.message
      );
      setUser(null);
    }
    setIsUserLoading(false); // Pastikan UI tidak loading terus
  };
  
  // ✅ Fungsi Login User (Langsung update user setelah login)
  const loginUser = async (email, password) => {
    try {
      console.log("🟢 Sending login request...", email, password);
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
  
      console.log("✅ Login Response:", response.data);
  
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user)); 
        return response.data.user;
      } else {
        console.error("❌ Token tidak ditemukan dalam response!", response.data);
        setError("Invalid response from server");
        return null;
      }
      
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed, please try again.");
      return null;
    }
  };
  
  
  const logoutUser = async () => {
    try {
      console.log("🚪 Logging out user...");
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user"); 
      console.log("✅ User logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data || error.message);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loginUser, logoutUser, isUserLoading, error }}
    >
      {children}
    </UserContext.Provider>
  );
};
