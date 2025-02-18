import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.post(`${apiUrl}/api/auth/register`, formData);

      if (data.message === "User registered successfully") {
        // Store user and token in localStorage after successful registration
        localStorage.setItem("token", data.token); // Save token
        localStorage.setItem("user", JSON.stringify(data.user)); // Save user object
  
        console.log("Storing user in localStorage:", data.user);
console.log("Storing token in localStorage:", data.token);

        toast.success("Registration successful! Please log in.", {
          autoClose: 2000,  // Toast lebih cepat
          theme: "colored",
        });
  
        setTimeout(() => navigate("/login"), 2500); 
      }
    } catch (error) {
      if (error.response && error.response.data.message === "User already exists") {
        setError("Email is already registered. Please use a different email.");
        toast.error("Email is already registered. Please use a different email.");
      } else {
        setError("Registration failed. Please try again.");
        toast.error("Registration failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded shadow-lg">
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            name="name"
            placeholder="Username"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
}
