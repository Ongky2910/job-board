import { useState, useEffect } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
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
        {/* Logo Job Board */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
          <Briefcase size={28} />
          <span>Job Board</span>
        </Link>

        {/* Menu untuk device besar */}
        <div className="hidden md:flex space-x-8 items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-300 font-bold">
                Dashboard
              </Link>
              <Link
                to="/edit-profile"
                className="hover:text-blue-300 font-bold"
              >
                Edit Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-blue-300 font-bold">
                Home
              </Link>
              <Link to="/jobs" className="hover:text-blue-300 font-bold">
                Jobs
              </Link>
              <Link to="/saved-jobs" className="hover:text-blue-300 font-bold">
                Saved Jobs
              </Link>
              <Link to="/contact" className="hover:text-blue-300 font-bold">
                Contact
              </Link>
            </>
          )}
        </div>

        {/* Logout & Dark Mode di Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="inline-flex items-center justify-center bg-transparent dark:bg-transparent p-0 transition transform hover:scale-110"
          >
            {isDarkMode ? (
              <FiMoon size={24} className="text-gray-400" />
            ) : (
              <FiSun size={24} className="text-yellow-300" />
            )}
          </button>

          {user && (
            <button
              onClick={logoutUser}
              className="inline-flex items-center justify-center bg-transparent dark:bg-transparent p-0 transition transform hover:scale-110"
              title="Logout"
            >
              <FiLogOut size={24} className="text-red-500 hover:text-red-400" />
            </button>
          )}
        </div>

        {/* Menu Hamburger (Mobile) */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="inline-flex items-center justify-center bg-transparent dark:bg-transparent p-0 transition transform hover:scale-110"
          >
            {isDarkMode ? (
              <FiMoon size={24} className="text-gray-400" />
            ) : (
              <FiSun size={24} className="text-yellow-300" />
            )}
          </button>

          {/* Logout Button */}
          {user && (
            <button
              onClick={logoutUser}
              className="inline-flex items-center justify-center transition bg-transparent dark:bg-transparent transform hover:scale-110"
              title="Logout"
            >
              <FiLogOut size={24} className="text-red-500 hover:text-red-400" />
            </button>
          )}
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex transition transform hover:scale-110 dark:text-gray-300 bg-transparent dark:bg-transparent"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Dropdown Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-blue-700 dark:bg-blue-900 text-white p-4 mt-2 rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()} 
        >
          <ul className="flex flex-col space-y-4">
            {["Home", "Jobs", "Saved Jobs", "Contact"].map((item, index) => (
              <motion.li
                key={item.toLowerCase()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="hover:text-blue-300 font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </Link>
              </motion.li>
            ))}

            {user && (
              <>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/dashboard"
                    className="hover:text-blue-300 font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/edit-profile"
                    className="hover:text-blue-300 font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    Edit Profile
                  </Link>
                </motion.li>
              </>
            )}
          </ul>
        </motion.div>
      )}
    </nav>
  );
}
