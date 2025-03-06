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
  const clearError = () => setError(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  // ✅ Fungsi Refresh Token (Memperbarui Access Token)
  const refreshToken = async () => {
    try {
      console.log("🔄 Refreshing token...");
      const response = await axios.get(`${API_URL}/api/auth/refresh-token`, {
        withCredentials: true,
      });
  
      if (response.data.token) {
        console.log("✅ New token:", response.data.token);
        
        // ⬇️ Perbaikan: Set Authorization header lebih dulu
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  
        localStorage.setItem("accessToken", response.data.token);
        return response.data.token;
      }
    } catch (error) {
      console.error("❌ Refresh token failed:", error);
      return null;
    }
  };
  

  // ✅ Cek autentikasi saat pertama kali load
  const checkAuth = async () => {
    setIsUserLoading(true);
    try {
      console.log("🔍 Checking authentication...");
      let accessToken = localStorage.getItem("accessToken");
  
      if (!accessToken) {
        console.warn("⚠️ No access token found. Attempting refresh...");
        accessToken = await refreshToken();
      }
  
      if (!accessToken) {
        console.error("❌ No valid token found, logging out...");
        return logoutUser(); // ⬅️ Logout hanya jika refresh token gagal
      }
  
      console.log("📌 Using token:", accessToken);
      const response = await axios.get(`${API_URL}/api/auth/verify-token`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
  
      console.log("✅ User authenticated:", response.data);
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("🔄 Token expired, trying to refresh...");
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          return checkAuth(); // Coba ulangi auth dengan token baru
        }
      }
      console.error("❌ Authentication error:", error);
    } finally {
      setIsUserLoading(false);
    }
  };
  
  useEffect(() => {
    setTimeout(() => {
      checkAuth();
    }, 1000); 
  }, []);
  

  const loginUser = async (email, password) => {
    try {
      console.log("🟢 Logging in...", email);
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
  
      console.log("✅ Login Response:", response.data);
  
      if (response.data.user && response.data.token) {
        console.log("🔑 Token received:", response.data.token);
        localStorage.setItem("accessToken", response.data.token);
        
        // Cek apakah token benar-benar tersimpan
        console.log("📌 Token saved in localStorage:", localStorage.getItem("accessToken"));
  
        setUser(response.data.user);
        return response.data.user;
      } else {
        console.error("❌ User data not found in response!");
        setError("Invalid response from server");
        return null;
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed, please try again.");
      return null;
    }
  };

  // ✅ Fungsi Logout
  const logoutUser = async () => {
    try {
      console.log("🚪 Logging out...");
      console.log("⛔ Current token before logout:", localStorage.getItem("accessToken"));
  
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
  
      setUser(null);
      localStorage.removeItem("accessToken");
      axios.defaults.headers.common["Authorization"] = "";
  
      console.log("✅ User logged out successfully!");
      console.log("🗑️ Token after logout:", localStorage.getItem("accessToken")); // Seharusnya null
  
      setIsUserLoading(false);
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };
  

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        refreshToken,
        logoutUser,
        isUserLoading,
        error,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
