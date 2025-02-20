import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
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

// Tema Context
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

// PrivateRoute untuk halaman yang membutuhkan login
const PrivateRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  console.log("🔥 React masih berjalan!");

  useEffect(() => {
    console.log("✅ App sudah dipasang!");
  }, []);

  const { jobs, isLoading } = useJobs();

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
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Navbar />
                      <HeroSection />
                      <JobList jobs={jobs} />
                    </>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<h1 style={{ color: "red" }}>Loading Dashboard...</h1>}>
                      <Dashboard />
                    </Suspense>
                  }
                />
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
            </ErrorBoundary>
            <ToastContainer />
          </div>
        </Suspense>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
