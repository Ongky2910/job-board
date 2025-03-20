import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";


const PrivateRoute = () => {
  const { user, loading } = useSelector((state) => state.user);
  const token = localStorage.getItem("accessToken");

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user || token ? <Outlet /> : <Navigate to="/login" replace />;
};



export default PrivateRoute;
