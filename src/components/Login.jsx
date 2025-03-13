import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/userSlice"; 
import { toast } from "react-toastify";
import { Eye, EyeOff, Briefcase } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ambil state dari Redux
  const { user, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    console.log("🔍 Checking user state:", user); // Debug
    if (user) {
      toast.success("Login successful!", { autoClose: 1500 });
      setTimeout(() => {
        console.log("✅ Navigating to home..."); // Debug sebelum navigate
        navigate("/");
      }, 1500);
    }
  }, [user, navigate]);
  
  

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.warning("Please fill in all fields!", { autoClose: 2000 });
      return;
    }

    // Dispatch loginUser dengan data dari form
    dispatch(loginUser({ email: formData.email, password: formData.password }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
        <div className="flex justify-center mb-0">
          <Briefcase size={25} />
        </div>
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
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
          <button className="text-gray-800 dark:text-gray-300 hover:underline bg-transparent dark:bg-transparent">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
