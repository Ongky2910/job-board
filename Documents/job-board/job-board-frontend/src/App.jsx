// App.jsx
import {
  BrowserRouter as Router,
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
import { Helmet } from "react-helmet";
import { ClipLoader } from "react-spinners";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider, useUser } from "./context/UserContext"; 
import useJobs from "./hooks/useJobs"; 

// Lazy-loaded components
const Navbar = lazy(() => import("./components/Navbar"));
const HeroSection = lazy(() => import("./components/HeroSection"));
const JobList = lazy(() => import("./components/JobList"));
const JobDetail = lazy(() => import("./components/JobDetail"));
const SavedJobs = lazy(() => import("./components/SavedJobs"));
const CompanyDetail = lazy(() => import("./components/CompanyDetail"));
const NotFound = lazy(() => import("./components/NotFound"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AuthGuard = lazy(() => import("./components/AuthGuard"));

// Theme context to handle dark mode
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// PrivateRoute component to protect routes that need authentication
const PrivateRoute = ({ element }) => {
  const { parsedUser } = useUser(); // Menggunakan useUser untuk akses parsedUser

  if (!parsedUser) {
    return <Navigate to="/login" />;
  }

  return element;
};

// Main App component
const App = () => {
  const { jobs, filteredJobs, setFilteredJobs, isLoading } = useJobs(); // Menggunakan custom hook

  // Fungsi untuk memfilter pekerjaan berdasarkan pencarian
  const filterJobs = (searchTerm) => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <ClipLoader color="blue" size={50} />
      </div>
    );
  }

  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
                <ClipLoader color="blue" size={50} />
              </div>
            }
          >
            <Helmet>
              <title>Job Board</title>
              <meta name="description" content="Find your dream job here!" />
            </Helmet>
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
              <ErrorBoundary>
                <Routes>
                  {/* Home Page */}
                  <Route
                    path="/"
                    element={
                      <>
                        <Navbar />
                        <HeroSection />
                        <JobList selectedJobs={filteredJobs} />
                      </>
                    }
                  />

                  {/* Job List Page */}
                  <Route
                    path="/jobs"
                    element={
                      <>
                        <Navbar />
                        <JobList selectedJobs={filteredJobs} />
                      </>
                    }
                  />

                  {/* Login Page */}
                  <Route path="/login" element={<Login />} />

                  {/* Register Page */}
                  <Route path="/register" element={<Register />} />

                  {/* Dashboard Page (Protected Route) */}
                  <Route
                    path="/dashboard"
                    element={
                      <AuthGuard>
                        <Dashboard />
                      </AuthGuard>
                    }
                  />

                  {/* Saved Jobs Page */}
                  <Route path="/saved-jobs" element={<SavedJobs />} />

                  {/* Job Detail Page */}
                  <Route path="/job/:id" element={<JobDetail />} />

                  {/* Company Detail Page */}
                  <Route
                    path="/company/:companyName"
                    element={<CompanyDetail />}
                  />

                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              <ToastContainer />
            </div>
          </Suspense>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
};

export default App;
