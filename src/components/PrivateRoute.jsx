import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";


const PrivateRoute = () => {
  const { user, loading } = useSelector((state) => state.user);
  const token = localStorage.getItem("accessToken");

  console.log("🔍 [PrivateRoute] user:", user);
  console.log("🔍 [PrivateRoute] token:", token);


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user || token ? (
    <>
      {console.log("✅ User Terautentikasi, masuk ke halaman private")}
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
