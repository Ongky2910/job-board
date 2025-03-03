import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../App";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  console.log("✅ Navbar dirender!");
  
  useEffect(() => {
    console.log("navigasi berubah, menu ditutup");
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    console.log(`Navigasi ke: ${path}, Menutup menu...`);
    navigate(path, { replace: true });
    setIsOpen(false);
  };

  return (
    <nav className="bg-blue-600 dark:bg-blue-950 text-white p-4 sticky top-0 z-10 shadow-lg transition-all duration-300 font-roboto">
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={() => handleNavigate("/")}
          className="text-2xl font-bold"
        >
          Job Board
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 items-center">
          {user ? (
            <>
              <li>
                <button
                  onClick={() => handleNavigate("/dashboard")}
                  className="hover:text-blue-300 font-bold"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate("/edit-profile")}
                  className="hover:text-blue-300 font-bold"
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    logoutUser();
                    setIsOpen(false); // Pastikan menu tertutup setelah logout
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition flex items-center justify-center"
                >
                  <FiLogOut size={20} />
                </button>
              </li>
            </>
          ) : (
            ["Home", "Jobs", "Saved Jobs", "Contact"].map((item) => (
              <li key={item}>
                <button
                  onClick={() =>
                    handleNavigate(`/${item.toLowerCase().replace(" ", "-")}`)
                  }
                  className="hover:text-blue-300 font-bold"
                >
                  {item}
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Theme Toggle & Mobile Menu Button */}
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
            onClick={() => {
              console.log("Menu toggle:", !isOpen);
              setIsOpen(!isOpen);
            }}
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
          onClick={() => setIsOpen(false)} // Tutup menu saat klik di luar
        >
          <div
            className="container mx-auto p-4"
            onClick={(e) => {
              e.stopPropagation(); 
              console.log("Klik di dalam menu, menu tidak harus tertutup");
            }}
          >
            <ul className="flex flex-col space-y-6 items-center text-xl">
              {(user
                ? ["Dashboard", "Edit Profile"]
                : ["Home", "Jobs", "Saved Jobs", "Contact"]
              ).map((item) => (
                <li key={item}>
                  <button
                    onClick={() =>
                      handleNavigate(`/${item.toLowerCase().replace(" ", "-")}`)
                    }
                    className="hover:text-blue-300 font-bold block py-2"
                  >
                    {item}
                  </button>
                </li>
              ))}
              {user && (
                <li>
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
                  >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
