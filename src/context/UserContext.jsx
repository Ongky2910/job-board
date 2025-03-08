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
        console.log("✅ New token received");
        localStorage.setItem("accessToken", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
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
        return logoutUser();
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
        console.warn("⚠️ No user found in verify-token response!");
        setUser(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("🔄 Token expired, trying to refresh...");
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          return checkAuth();
        }
      }
      console.error("❌ Authentication error:", error);
    } finally {
      setIsUserLoading(false);
    }
  };
  
  useEffect(() => {
    if (!["/register", "/login"].includes(window.location.pathname)) {
      checkAuth();
    }
  }, []);

  // ✅ Fungsi Login
  const loginUser = async (email, password) => {
    setIsUserLoading(true);
    try {
      console.log("🟢 Logging in...", email);
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
  
      console.log("✅ Login Response:", response.data);
  
      if (response.data.user) {
        console.log("👤 User logged in:", response.data.user);
  
        // ⬇️ Set user langsung, tanpa harus menunggu token
        setUser(response.data.user);
  
        // 🔄 Coba refresh token karena token ada di cookies
        await refreshToken();
  
        return response.data.user;
      } else {
        console.error("❌ User data not found in response!");
        setError("Invalid response from server");
        return null;
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Login failed, please try again."
      );
      return null;
    } finally {
      setIsUserLoading(false);
    }
  };
  

  // ✅ Fungsi Logout
  const logoutUser = async () => {
    try {
      console.log("🚪 Logging out...");
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
      console.log("✅ User logged out successfully!");
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
