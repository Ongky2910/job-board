import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useUser();
  const navigate = useNavigate();
  const clearError = () => setError(null);

  useEffect(() => {
    clearError();
  }, []);
  
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await loginUser(formData.email, formData.password);
      toast.success(" Login successful!", { autoClose: 1500 });
      navigate("/");
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message || "Email or password is incorrect.";

      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    if (!formData.email) {
      toast.warning("Please enter your email first!", { autoClose: 2000 });
      return;
    }
    // 🔹 TODO: Implementasi API reset password
    toast.info("📩 Reset password link has been sent to your email!", {
      autoClose: 2500,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login
        </h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center bg-transparent dark:bg-transparent text-gray-500 dark:text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-300"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
          <span>
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline inline-block"
            >
              Register
            </a>
          </span>
          <button
            onClick={handleForgotPassword}
            className="text-gray-800 dark:text-gray-300 hover:underline bg-transparent dark:bg-transparent"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
