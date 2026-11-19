
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Bug } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, loading } = useAuth();

  const successMessage = location.state?.message;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const loggedInUser = await login(formData);

      if (loggedInUser.role === "MANAGER") {
        navigate("/manager/dashboard", { replace: true });
      } else if (loggedInUser.role === "DEVELOPER") {
        navigate("/developer/dashboard", { replace: true });
      } else {
        setError("You are not authorized to access this application.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Bug size={30} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            Bug Tracker
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Sign in to your workspace
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Welcome back!
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Enter your credentials to continue.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-5">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-5">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Signup Link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}
