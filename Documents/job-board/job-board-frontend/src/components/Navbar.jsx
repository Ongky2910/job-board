import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon } from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ambil user dari localStorage saat Navbar pertama kali dirender
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser); // Parsing data user
        console.log("User loaded from localStorage:", parsedUser);
        setUser(parsedUser); // Set user ke context setelah refresh
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user"); // Hapus jika data invalid
        localStorage.removeItem("token"); // Hapus token jika user invalid
        setUser(null);
      }
    } else {
      console.log("No user found in localStorage");
      setUser(null);
    }
    setIsLoading(false);
  }, [setUser]);


  return (
    <nav className="bg-blue-600 dark:bg-blue-950 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-300 font-roboto">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Job Board
        </Link>

        {/* Navbar links */}
        {user ? (
          <ul className="flex space-x-8 items-center">
            {!isLoading && user && (
              <li>
                <Link to="/dashboard" className="hover:text-blue-300 font-bold">
                  Dashboard
                </Link>
              </li>
            )}
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
                className="hover:text-blue-300 font-bold"
              >
                Logout
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

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full md:mr-4 transition-all duration-300"
        >
          {isDarkMode ? (
            <FiMoon size={24} className="text-gray-400" />
          ) : (
            <FiSun size={24} className="text-yellow-300" />
          )}
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu with Animations */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-blue-700 p-4 md:hidden shadow-lg">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                to="/"
                className="hover:text-white block"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="hover:text-white block"
                onClick={() => setIsOpen(false)}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/saved-jobs"
                className="hover:text-white block"
                onClick={() => setIsOpen(false)}
              >
                Saved Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-white block"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-white block"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/edit-profile"
                    className="hover:text-white block"
                    onClick={() => setIsOpen(false)}
                  >
                    Edit Profile
                  </Link>
                </li>
                <li>
                  <button onClick={logoutUser} className="text-red-600 block">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
