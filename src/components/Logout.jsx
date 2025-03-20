import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/userSlice";
import { toast } from "react-toastify";

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      dispatch(logoutUser()).then(() => {
        toast.info("You have been logged out.");
        navigate("/login");
      });
    } else {
      navigate(-1); 
    }
  }, [dispatch, navigate]);

  return <p>Logging out...</p>;
}
