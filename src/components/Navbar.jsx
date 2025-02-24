import { useState, useEffect } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon } from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("User loaded from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
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
        <Link to="/" className="flex items-center text-2xl font-bold">
          <Briefcase size={25} className="mx-2" />
          Job Board
        </Link>

        {/* Navbar links */}
        <div className="hidden md:flex space-x-8 items-center">
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
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-blue-300 font-bold">
                Dashboard
              </Link>
              <Link to="/edit-profile" className="hover:text-blue-300 font-bold">
                Edit Profile
              </Link>
              <button onClick={logoutUser} className="hover:text-red-400 font-bold">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile & Dark Mode Toggle */}
        <div className="flex items-center gap-x-2 md:gap-x-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition-all duration-300 mr-2"
          >
            {isDarkMode ? (
              <FiMoon size={22} className="text-gray-400" />
            ) : (
              <FiSun size={22} className="text-yellow-300" />
            )}
          </button>

          <button
            className="md:hidden p-2 bg-transparent dark:bg-transparent text-gray-900 dark:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-blue-700 p-4 md:hidden shadow-lg transition-all duration-300">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link to="/" className="hover:text-white block" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-white block" onClick={() => setIsOpen(false)}>
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/saved-jobs" className="hover:text-white block" onClick={() => setIsOpen(false)}>
                Saved Jobs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white block" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-white block" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/edit-profile" className="hover:text-white block" onClick={() => setIsOpen(false)}>
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
