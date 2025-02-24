import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "../context/UserContext";


const PrivateRoute = () => {
const { user, isUserLoading } = useUser();

console.log(" Cek user di PrivateRoute:", user);

    if (isUserLoading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
