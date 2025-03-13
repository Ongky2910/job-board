import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { user, loading } = useSelector((state) => state.user); 
  console.log("Redux User State:", { user, loading });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
