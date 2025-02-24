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

  useEffect(() => {
    checkAuth(); // Mengecek login saat pertama kali app dijalankan
  }, []);

  // ✅ Fungsi Login User
  const loginUser = async (email, password) => {
    try {
      console.log("🟢 Sending login request...", email, password);
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password },
        { withCredentials: true } // Harusnya token tersimpan di cookie
      );
  
      console.log("✅ Login Response:", response.data);
  
      if (response.data.user) {
        console.log("✅ Login Successful:", response.data);
        setUser(response.data.user);
  
        // Cek apakah ada token
        console.log("🔑 Token dari response:", response.data.token);
        if (!response.data.token) {
          console.error("❌ Token tidak ditemukan dalam response!");
        }
  
        navigate("/dashboard");
      } else {
        console.error("❌ Response tidak valid:", response.data);
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed, please try again.");
    }
  };
  

  // ✅ Fungsi Logout User
  const logoutUser = async () => {
    try {
      console.log("🚪 Logging out user...");
      await axios.post(
        "http://localhost:5001/api/auth/logout",
        {},
        { withCredentials: true } // Pastikan cookie dihapus
      );
      setUser(null); // Reset user state
      console.log("✅ User logged out successfully!");
      navigate("/login"); // Redirect ke halaman login
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data || error.message);
    }
  };

  // ✅ Fungsi untuk mengecek user saat pertama kali load
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking user authentication...");
      const response = await axios.get(
        "http://localhost:5001/api/auth/verify-token",
        { withCredentials: true }
      );
      console.log("✅ Authenticated User:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.warn("⚠️ User not authenticated:", error.response?.data || error.message);
      setUser(null);
    }
    setIsUserLoading(false);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser, isUserLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};
