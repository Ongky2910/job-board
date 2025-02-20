import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔴 Logging out...");
    navigate("/login"); // ✅ Redirect setelah logout
  }, [navigate]);

  return <p>Logging out...</p>;
}
