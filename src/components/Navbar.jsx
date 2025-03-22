import { useState } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux"; 
import { logoutUser } from "../redux/slices/userSlice";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 dark:bg-blue-950 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-300 font-roboto">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Job Board */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
          <Briefcase size={28} />
          <span>Job Board</span>
        </Link>

        {/* Menu untuk Desktop */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/" className="hover:text-blue-300 font-bold">Home</Link>
          <Link to="/jobs" className="hover:text-blue-300 font-bold">Jobs</Link>
          <Link to="/contact" className="hover:text-blue-300 font-bold">Contact</Link>

          {user && (
            <>
              <Link to="/dashboard" className="hover:text-blue-300 font-bold">Dashboard</Link>
              <Link to="/edit-profile" className="hover:text-blue-300 font-bold">Edit Profile</Link>
            </>
          )}
        </div>

        {/* Dark Mode & Logout (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="hover:scale-110 transition duration-300 ease-in-out bg-transparent dark:bg-transparent"
          >
            {isDarkMode ? (
              <FiMoon size={24} className="text-gray-400 hover:text-gray-300" />
            ) : (
              <FiSun size={24} className="text-yellow-300 hover:text-yellow-400" />
            )}
          </button>

          {user && (
            <button 
              onClick={handleLogout} 
              className="hover:scale-110 transition duration-300 ease-in-out bg-transparent dark:bg-transparent"
              title="Logout"
            >
              <FiLogOut size={24} className="text-red-500 hover:text-red-400" />
            </button>
          )}
        </div>

        {/* Menu Mobile */}
        <div className="flex md:hidden items-center space-x-3">
          <button 
            onClick={toggleDarkMode} 
            className="hover:scale-110 transition duration-300 ease-in-out bg-transparent dark:bg-transparent"
          >
            {isDarkMode ? (
              <FiMoon size={24} className="text-gray-400 hover:text-gray-300" />
            ) : (
              <FiSun size={24} className="text-yellow-300 hover:text-yellow-400" />
            )}
          </button>

          {user && (
            <button 
              onClick={handleLogout} 
              className="hover:scale-110 transition duration-300 ease-in-out bg-transparent dark:bg-transparent"
              title="Logout"
            >
              <FiLogOut size={24} className="text-red-500 hover:text-red-400" />
            </button>
          )}

          {/* Hamburger Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="hover:scale-110 transition dark:text-white bg-transparent dark:bg-transparent">
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
        >
          <ul className="flex flex-col space-y-4">
            {["Home", "Jobs", "Contact"].map((item) => (
              <motion.li key={item.toLowerCase()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to={`/${item.toLowerCase()}`} className="hover:text-blue-300 font-bold" onClick={() => setIsOpen(false)}>
                  {item}
                </Link>
              </motion.li>
            ))}

            {user && (
              <>
                <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/dashboard" className="hover:text-blue-300 font-bold" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </motion.li>
                <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/edit-profile" className="hover:text-blue-300 font-bold" onClick={() => setIsOpen(false)}>
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
