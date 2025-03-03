import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // 🔥 Solusi: Tutup menu setelah pindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-blue-600 dark:bg-blue-950 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-300 font-roboto">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Job Board
        </Link>

        {user ? (
          <ul className="hidden md:flex space-x-8 items-center">
            <li>
              <Link to="/dashboard" className="hover:text-blue-300 font-bold">
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/edit-profile"
                className="hover:text-blue-300 font-bold"
              >
                Edit Profile
              </Link>
            </li>
            <li>
              <button
                onClick={logoutUser}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition flex items-center justify-center"
              >
                <FiLogOut size={20} />
              </button>
            </li>
          </ul>
        ) : (
          <ul className="hidden md:flex space-x-8 items-center">
            <li>
              <Link to="/" className="hover:text-blue-300 font-bold">
                Home
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-blue-300 font-bold">
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/saved-jobs" className="hover:text-blue-300 font-bold">
                Saved Jobs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-blue-300 font-bold">
                Contact
              </Link>
            </li>
          </ul>
        )}

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition"
          >
            {isDarkMode ? (
              <FiMoon size={24} className="text-gray-400" />
            ) : (
              <FiSun size={24} className="text-yellow-300" />
            )}
          </button>

          {/* Menu Hamburger (Mobile) */}
          <button
  className="md:hidden p-2 bg-transparent z-50 relative"
  onClick={() => setIsOpen((prev) => !prev)}
  aria-label="Toggle menu"
>
  {isOpen ? <X size={28} /> : <Menu size={28} />}
</button>


        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-blue-600 dark:bg-blue-950 z-10 pt-20"
          onClick={() => setIsOpen(false)}
        >
          <div className="container mx-auto p-4">
            {user ? (
              <ul className="flex flex-col space-y-6 items-center text-xl">
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-blue-300 font-bold block py-2"
                    onClickCapture={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/edit-profile"
                    className="hover:text-blue-300 font-bold block py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    Edit Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logoutUser();
                    }}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
                  >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="flex flex-col space-y-6 items-center text-xl">
                <li>
                  <Link
                    to="/"
                    className="hover:text-blue-300 font-bold block py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="hover:text-blue-300 font-bold block py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/saved-jobs"
                    className="hover:text-blue-300 font-bold block py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    Saved Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-blue-300 font-bold block py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    Contact
                  </Link>
                  ç
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
