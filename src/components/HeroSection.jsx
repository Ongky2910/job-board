import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice"; 
import Cookies from "js-cookie";

export default function HeroSection() {
  const dispatch = useDispatch();
  const { user, loading: isUserLoading } = useSelector((state) => state.user);
  const [displayName, setDisplayName] = useState("User");

  // Pertama, cek apakah user ada di localStorage atau Cookies
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || Cookies.get("user");
  
    if (storedUser) {
      try {
        // Check if it's a valid string that can be parsed into JSON
        const parsedUser = typeof storedUser === "string" ? JSON.parse(storedUser) : storedUser;
        console.log("🔍 User found:", parsedUser);
        dispatch(setUser(parsedUser));
        setDisplayName(parsedUser.name || parsedUser.email.split('@')[0]);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Handle the error gracefully, maybe clear invalid data or notify the user
        localStorage.removeItem("user");
        Cookies.remove("user");
      }
    } else {
      console.log("🔍 No user data found.");
    }
  }, [dispatch]);
  

  // Jika user state berubah, set displayName berdasarkan nama pengguna
  useEffect(() => {
    console.log("🔍 Checking user state in HeroSection:", user);

    if (user && typeof user === "object" && (user.name || user.email)) {
      if (user.name) {
        console.log("✅ User name detected:", user.name);
        setDisplayName(user.name);
      } else if (user.email) {
        const nameFromEmail = user.email.split('@')[0];
        console.log("📧 Extracted name from email:", nameFromEmail);
        setDisplayName(nameFromEmail);
      }
    }
  }, [user]);

  useEffect(() => {
    console.log("⏳ Loading state:", isUserLoading);
  }, [isUserLoading]);

  if (isUserLoading) {
    return (
      <section className="h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white px-6">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Loading...
        </motion.h1>
      </section>
    );
  }

  return (
    <section className="h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white px-6">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl"
      >
        Find Your Dream Job
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-4 text-xl sm:text-lg"
      >
        Hi, {displayName}!
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-4 text-lg sm:text-base md:text-lg lg:text-xl"
      >
        Browse thousands of job listings from top companies.
      </motion.p>
      <motion.a
        href="/jobs"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-600 transition duration-300 sm:px-4 sm:py-2 lg:px-8 lg:py-4"
      >
        Get Started
      </motion.a>
    </section>
  );
}