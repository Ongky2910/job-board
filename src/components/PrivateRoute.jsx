import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const PrivateRoute = () => {
  const { user, loading } = useSelector((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("accessToken") || Cookies.get("accessToken"));

  useEffect(() => {
    console.log("🔍 [PrivateRoute] Token di localStorage:", token);
    console.log("🔍 [PrivateRoute] User dari Redux:", user);
    setTimeout(() => setIsChecking(false), 500); // Delay kecil untuk menunggu Redux
  }, [user, token]);

  if (loading || isChecking) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user && token ? (
    <>
      {console.log("✅ User dan token valid, masuk ke halaman private")}
      <Outlet />
    </>
  ) : (
    <>
      {console.log("❌ Tidak ada user/token, redirect ke /login")}
      <Navigate to="/login" replace />
    </>
  );
};

export default PrivateRoute;