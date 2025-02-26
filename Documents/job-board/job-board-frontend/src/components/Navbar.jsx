import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    // Fetch user dari backend jika user belum ada di context
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/dashboard`, {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        logoutUser();
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [user, setUser, logoutUser, API_URL]);

  return (
    <nav className="bg-blue-600 dark:bg-blue-950 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-300 font-roboto">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Job Board</Link>

        {/* Menu untuk user login */}
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
              {/* Tombol Logout dengan Icon */}
              <button
                onClick={logoutUser}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition flex items-center justify-center"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </li>
          </ul>
        ) : (
          // Menu untuk guest (belum login)
          <ul className="hidden md:flex space-x-8 items-center">
            <li><Link to="/" className="hover:text-blue-300 font-bold">Home</Link></li>
            <li><Link to="/jobs" className="hover:text-blue-300 font-bold">Jobs</Link></li>
            <li><Link to="/saved-jobs" className="hover:text-blue-300 font-bold">Saved Jobs</Link></li>
            <li><Link to="/contact" className="hover:text-blue-300 font-bold">Contact</Link></li>
          </ul>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full md:mr-4 transition"
        >
          {isDarkMode ? (
            <FiMoon size={24} className="text-gray-400" />
          ) : (
            <FiSun size={24} className="text-yellow-300" />
          )}
        </button>

        {/* Menu Hamburger (Mobile) */}
        <button className="md:hidden p-2 bg-transparent" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}
