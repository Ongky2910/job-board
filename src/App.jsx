import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import {
  lazy,
  Suspense,
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ClipLoader } from "react-spinners";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useJobs from "./hooks/useJobs";
import PrivateRoute from "./components/PrivateRoute";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logoutUser } from "./redux/slices/userSlice";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { verifyToken } from "./redux/slices/userSlice";

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

  // ✅ Ambil user dari Redux agar tetap login setelah refresh
  const user = useSelector((state) => state.user.user);
  const memoizedUser = useMemo(() => user, [user]);
  const isUserLoggedIn = useMemo(() => !!user, [user]);

  console.log("🟢 User dari Redux:", user);
  console.log("🔍 isUserLoggedIn:", isUserLoggedIn);

  // ✅ Pastikan Redux Persist selesai dulu
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsPersisted(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // ✅ Gunakan Redux Thunk verifyToken untuk verifikasi token
  useEffect(() => {
    if (!isPersisted) return; // Tunggu Redux Persist selesai dulu

    // 🚀 Cek apakah sedang di halaman /login atau /register
    if (location.pathname === "/login" || location.pathname === "/register") {
      console.log("🛑 Skip verifikasi token di halaman login/register");
      setIsTokenVerified(true);
      return;
    }

    const token =
      Cookies.get("accessToken") || localStorage.getItem("accessToken");
    if (!token) {
      console.log("🚫 Tidak ada token, tidak perlu verifikasi");
      setIsTokenVerified(true);
      return;
    }

    dispatch(verifyToken())
      .unwrap()
      .then((user) => {
        console.log("✅ Token valid, user ditemukan:", user);
      })
      .catch((error) => {
        console.error("❌ Token tidak valid, harus logout:", error);
        dispatch(logoutUser());
        navigate("/login");
      })
      .finally(() => {
        console.log("🔄 Verifikasi token selesai.");
        setIsTokenVerified(true);
      });
  }, [isPersisted, dispatch, navigate]);

  useEffect(() => {
    if (!isPersisted || !isTokenVerified) return;

    // 🚀 Skip redirect jika user ada di halaman login atau register
    if (location.pathname === "/login" || location.pathname === "/register") {
      console.log("🛑 Skip redirect di halaman login/register");
      return;
    }
    
    if (!isUserLoggedIn) {
      console.log("🚀 Token tidak valid, redirect ke login...");
      navigate("/login");
    }
  }, [isPersisted, isTokenVerified, isUserLoggedIn, navigate]);

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
                        <Dashboard user={memoizedUser} />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route path="saved-jobs" element={<SavedJobs />} />
              </Route>
            )}
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="/jobs" element={<JobList jobs={jobs} isLoading={isLoading} />} />
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
      <PersistGate loading={null} persistor={persistor}>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
              <ClipLoader color="blue" size={50} />
            </div>
          }
        >
          <AppContent />
        </Suspense>
      </PersistGate>
    </ThemeProvider>
  );
};

export default App;
