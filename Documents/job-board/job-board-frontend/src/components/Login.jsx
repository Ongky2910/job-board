import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  // Handle input field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi form input
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Validasi format email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login", // Ganti dengan URL API yang sesuai
        formData
      );
      console.log("Login Response:", response);

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;

        // Pastikan user memiliki properti name
        if (!user.name) {
          user.name = "user"; // Atau nilai default lain
        }
      // Simpan token dan user ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
      }));
      console.log(localStorage.getItem("userProfile"));

      // Update state user di context
      setUser(user);

        console.log("User saved:", user);
        console.log("Token stored:", token);

        toast.success("Login successful!", { autoClose: 2000 });

        // Redirect setelah 2 detik
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Email/Password is incorrect. Please try again.");
      }
    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data || error.message || error
      );
      setError("Email / Password is incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <a href="/register" className="text-blue-600">
          Register
        </a>
      </p>
    </div>
  );
}
