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

  const API_URL = import.meta.env.VITE_BACKEND_URL; 

  // ✅ Fungsi Login User
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
        console.log("✅ Login Successful:", response.data);
  
        // Cek apakah ada token
        console.log("🔑 Token dari response:", response.data.token);
        if (!response.data.token) {
          console.error("❌ Token tidak ditemukan dalam response!");
        }
  
        navigate("/dashboard");
      } else {
        console.error("❌ Invalid response from server:", response.data);
        setError("Invalid response from server");
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed, please try again.";

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };
  

  // ✅ Fungsi Logout User
  const logoutUser = async () => {
    try {
      console.log("🚪 Logging out user...");
      await axios.post(
       `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true } 
      );
      setUser(null); // Reset user state
      console.log("✅ User logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data || error.message);
    }
  };

  // ✅ Fungsi untuk mengecek user saat pertama kali load
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking user authentication...");
      const response = await axios.get(
       `${API_URL}/api/auth/verify-token`,
        { withCredentials: true }
      );
      console.log("✅ Authenticated User:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.warn("⚠️ User not authenticated:", error.response?.data || error.message);
      setUser(null);
    } finally {
      setIsUserLoading(false); 
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser, isUserLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};
