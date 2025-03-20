import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import {
  lazy,
  Suspense,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { ClipLoader } from "react-spinners";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useJobs from "./hooks/useJobs";
import PrivateRoute from "./components/PrivateRoute";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser, logoutUser } from "./redux/slices/userSlice";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Lazy-loaded components
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import JobList from "./components/JobList";
import JobDetail from "./components/JobDetail";
import SavedJobs from "./components/SavedJobs";
import CompanyDetail from "./components/CompanyDetail";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import Logout from "./components/Logout";
import Dashboard from "./components/Dashboard";
import EditProfile from "./pages/EditProfile";

// Theme Context
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ AppContent yang menggunakan useJobs()
const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, isLoading } = useJobs();
  const location = useLocation();
  const hiddenNavRoutes = ["/login", "/register"];
  const isNavHidden = hiddenNavRoutes.includes(location.pathname);

  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // ✅ Tambahkan ini

  // ✅ Tunggu Redux Persist selesai sebelum mulai verifikasi user
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsPersisted(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // ✅ Verifikasi Token Jika Ada
  useEffect(() => {
    if (!isPersisted) return; // Pastikan Redux Persist selesai dulu

    const token = localStorage.getItem("accessToken") || Cookies.get("accessToken");

    if (!token) {
      console.log("❌ Tidak ada token, mengarahkan ke login...");
      setIsTokenVerified(true);
      navigate("/login");
      return;
    }

    // Jika ada token, lakukan verifikasi
    axios
      .get("/api/auth/verify-token")
      .then((response) => {
        if (response.data.user) {
          dispatch(setUser(response.data.user));
          setIsUserLoggedIn(true); // ✅ Tandai bahwa user benar-benar login
          setIsTokenVerified(true);
        } else {
          console.log("❌ Token tidak valid, logout...");
          dispatch(logoutUser());
          localStorage.removeItem("accessToken");
          Cookies.remove("accessToken");
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("Token verification failed:", error);
        dispatch(logoutUser());
        localStorage.removeItem("accessToken");
        Cookies.remove("accessToken");
        navigate("/login");
      });
  }, [isPersisted, dispatch, navigate]);

  // ✅ Cek User dari localStorage dengan aman
  useEffect(() => {
    if (!isPersisted) return; // Pastikan Redux Persist selesai dulu
  
    const token = localStorage.getItem("accessToken") || Cookies.get("accessToken");
  
    if (!token) {
      console.log("❌ Tidak ada token, mengarahkan ke login...");
      setIsTokenVerified(true);
      navigate("/login");
      return;
    }
  
    // Jika ada token, lakukan verifikasi
    axios
      .get("/api/auth/verify-token")
      .then((response) => {
        if (response.data.user) {
          dispatch(setUser(response.data.user));
          setIsUserLoggedIn(true); // ✅ Tandai bahwa user benar-benar login
          setIsTokenVerified(true);
        } else {
          console.log("❌ Token tidak valid, logout...");
          dispatch(logoutUser());
          localStorage.removeItem("accessToken");
          Cookies.remove("accessToken");
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("Token verification failed:", error);
        dispatch(logoutUser());
        localStorage.removeItem("accessToken");
        Cookies.remove("accessToken");
        navigate("/login");
      });
  }, [isPersisted, dispatch, navigate]);
  

  // ✅ Jangan tampilkan halaman jika persist atau token belum selesai
  if (!isPersisted || !isTokenVerified) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <ClipLoader color="blue" size={50} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
              <ClipLoader color="blue" size={50} />
            </div>
          }
        >
          {!isNavHidden && <Navbar />}
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <JobList jobs={jobs} isLoading={isLoading} />
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />

            {/* ✅ PrivateRoute untuk halaman yang butuh login */}
            {isUserLoggedIn && (
              <Route path="/" element={<PrivateRoute />}>
                <Route
                  path="dashboard"
                  element={
                    <ErrorBoundary>
                      <Suspense
                        fallback={
                          <h1 style={{ color: "red" }}>Loading Dashboard...</h1>
                        }
                      >
                        <Dashboard />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route path="saved-jobs" element={<SavedJobs />} />
              </Route>
            )}
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </ErrorBoundary>
    </div>
  );
};


// ✅ UserProvider dipanggil di sini agar `useJobs()` bisa mendapatkan user
const App = () => {
  return (
    <ThemeProvider>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
            <ClipLoader color="blue" size={50} />
          </div>
        }
      >
        <AppContent />
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
