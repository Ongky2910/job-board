import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";  // Pastikan import useUser dari context

export default function HeroSection() {
  const { user } = useUser();  // Ambil data pengguna dari context

  // Menampilkan Nama User di HeroSection
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white px-6">
      {/* Animasi Fade-in */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl"
      >
        Find Your Dream Job
      </motion.h1>

      {/* Tampilkan Nama User jika ada */}
      {user && user.name ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 text-xl sm:text-lg"
        >
          Hi, {user.name}!
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 text-xl sm:text-lg"
        >
          Hi, User!
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-4 text-lg sm:text-base md:text-lg lg:text-xl"
      >
        Browse thousands of job listings from top companies.
      </motion.p>

      {/* Tombol dengan efek hover dan responsif */}
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
