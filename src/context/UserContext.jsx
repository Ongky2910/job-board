import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [error, setError] = useState(null);
  const clearError = () => setError(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  // ✅ Buat instance axios dengan interceptor
  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  // ✅ Fungsi Refresh Token (Memperbarui Access Token)
  const refreshToken = async () => {
    try {
      console.log("🔄 Refreshing token...");
      const response = await api.get("/api/auth/refresh-token");

      if (response.data.token) {
        console.log("✅ New token received:", response.data.token);
        localStorage.setItem("accessToken", response.data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        return response.data.token;
      }
    } catch (error) {
      console.error("❌ Refresh token failed:", error);
      return null;
    }
  };

  // ✅ Interceptor untuk menangani token expired
  useEffect(() => {
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.warn("🔄 Token expired! Refreshing...");
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(error.config); // Ulangi request dengan token baru
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);

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
      const response = await api.get("/api/auth/verify-token", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("✅ User authenticated:", response.data);
      setUser(response.data.user || null);
    } catch (error) {
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
      const response = await api.post("/api/auth/login", { email, password });

      console.log("✅ Login Response:", response.data);

      if (response.data.user) {
        console.log("👤 User logged in:", response.data.user);
        setUser(response.data.user);
        await refreshToken();
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
    } finally {
      setIsUserLoading(false);
    }
  };

  // ✅ Fungsi Logout
  const logoutUser = async () => {
    try {
      console.log("🚪 Logging out...");
      await api.post("/api/auth/logout");
      setUser(null);
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];

      toast.success("Logout successful! 👋");
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
