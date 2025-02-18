// AuthGuard.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Komponen ini akan mengarahkan ke login jika user tidak ditemukan atau token tidak ada.
const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        JSON.parse(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AuthGuard;
