import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const AuthGuard = ({ children }) => {
const { user, isUserLoading } = useUser();
console.log("🔍 Checking user in AuthGuard:", user);
  if (isUserLoading) {
    return <div className="flex justify-center items-center h-screen">Loading. . .</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default AuthGuard;

