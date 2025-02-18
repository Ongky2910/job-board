// PrivateRoute.jsx
import { Navigate, Redirect, Route } from "react-router-dom";
import { useEffect, useState } from "react";

// Komponen ini akan melindungi route yang memerlukan autentikasi
const PrivateRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mengecek apakah token ada di localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    // Anda bisa menampilkan loader sementara pengecekan autentikasi berlangsung
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Jika tidak terautentikasi, arahkan ke halaman login
    return <Navigate to="/login" />;
  }

  // Jika sudah terautentikasi, tampilkan elemen yang diterima sebagai prop
  return element;
};

export default PrivateRoute;
