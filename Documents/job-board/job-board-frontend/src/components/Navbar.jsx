import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  useEffect(() => {
    // Fetch user dari backend jika user belum ada di context
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "https://amused-liberation-production.up.railway.app/api/auth/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        logoutUser(); // Hapus user jika token tidak valid
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [user, setUser, logoutUser]);

  return (
    <nav className="bg-blue-600 dark:bg-blue-950 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-300 font-roboto">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Job Board</Link>

        {user ? (
          <ul className="flex space-x-8 items-center">
            <li>
              <Link to="/dashboard" className="hover:text-blue-300 font-bold">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/edit-profile" className="hover:text-blue-300 font-bold">
                Edit Profile
              </Link>
            </li>
            <li>
              <button onClick={logoutUser} className="hover:text-blue-300 font-bold">
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul className="hidden md:flex space-x-8 items-center">
            <li><Link to="/" className="hover:text-blue-300 font-bold">Home</Link></li>
            <li><Link to="/jobs" className="hover:text-blue-300 font-bold">Jobs</Link></li>
            <li><Link to="/saved-jobs" className="hover:text-blue-300 font-bold">Saved Jobs</Link></li>
            <li><Link to="/contact" className="hover:text-blue-300 font-bold">Contact</Link></li>
          </ul>
        )}

        <button onClick={toggleDarkMode} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full md:mr-4">
          {isDarkMode ? <FiMoon size={24} className="text-gray-400" /> : <FiSun size={24} className="text-yellow-300" />}
        </button>

        <button className="md:hidden p-2 bg-transparent" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}
