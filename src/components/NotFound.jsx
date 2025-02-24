import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      {/* Icon Not Found */}
      <AlertTriangle size={80} className="text-red-500 dark:text-red-400 mb-4 animate-pulse" />

      {/* Title */}
      <h1 className="text-5xl font-bold mb-2">404 - Not Found</h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* Button Back to Home */}
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
}
