import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, createContext, useState, useContext, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider, useUser } from "./context/UserContext"; 
import useJobs from "./hooks/useJobs";

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

// ✅ PrivateRoute untuk halaman yang membutuhkan login
const PrivateRoute = ({ children }) => {
  const { user } = useUser(); 

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ✅ AppContent yang menggunakan useJobs()
const AppContent = () => {
  const { jobs, isLoading } = useJobs();
  const location = useLocation(); 
  const hiddenNavRoutes = ["/login", "/register"]; 
  const isNavHidden = hiddenNavRoutes.includes(location.pathname);

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

            {/* Private Route for Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <Suspense fallback={<h1 style={{ color: "red" }}>Loading Dashboard...</h1>}>
                      <Dashboard />
                    </Suspense>
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />

            {/* Private Route for Saved Jobs */}
            <Route
              path="/saved-jobs"
              element={
                <PrivateRoute>
                  <SavedJobs />
                </PrivateRoute>
              }
            />

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
      <UserProvider>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
              <ClipLoader color="blue" size={50} />
            </div>
          }
        >
          <AppContent />
        </Suspense>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
