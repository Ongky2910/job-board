import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/userSlice"; 

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logoutUser());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    Cookies.remove("accessToken");
    Cookies.remove("user");
    navigate("/login");
  }, [dispatch, navigate]);
  

  return <p>Logging out...</p>;
}
