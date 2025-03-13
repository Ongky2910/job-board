import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser, logoutUser } from "../redux/slices/userSlice"; 

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isUserLoading, error } = useSelector((state) => state.user);

  const handleLogin = async (email, password) => {
    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();
      toast.success("Login successful!");
      navigate("/home");
      return response;
    } catch (err) {
      toast.error(err.message || "Login failed!");
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider value={{ handleLogin, handleLogout, isUserLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
