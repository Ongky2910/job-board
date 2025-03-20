import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; 
import { persistor } from "../redux/store";

const getValidToken = () => {
  const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      console.log("⛔ Token expired, menghapus dan redirect ke login!");
      Cookies.remove("accessToken");
      localStorage.removeItem("accessToken");
      return null;
    }
    return token;
  } catch (error) {
    console.log("⚠️ Token tidak valid:", error);
    return null;
  }
};

const PrivateRoute = () => {
  const { user, loading } = useSelector((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);
  const [rehydrated, setRehydrated] = useState(false);

  // ✅ Gunakan useMemo agar tidak berubah setiap render
  const token = useMemo(() => getValidToken(), [Cookies.get("accessToken")]);

  useEffect(() => {
    persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        setRehydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    console.log("🔍 [PrivateRoute] Token:", token);
    console.log("🔍 [PrivateRoute] User Redux:", user);
    setTimeout(() => setIsChecking(false), 500);
  }, []); // ✅ Hanya jalankan sekali saat pertama kali mount

  if (loading || isChecking) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || !user.id || !token) {
    console.log("❌ Tidak ada user/token, redirect ke /login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ User dan token valid, masuk ke halaman private");
  return <Outlet />;
};

export default PrivateRoute;
