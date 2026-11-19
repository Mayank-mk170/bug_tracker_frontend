
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bug, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        email: location.state?.email || "",
        password: "",
        confirmPassword: "",
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

        if (
            !formData.fullName.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await register({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    message: "Registration successful! ",
                },
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Registration failed. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-7">
                    <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Bug size={30} className="text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mt-4">
                        Bug Tracker
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Create your workspace account
                    </p>
                </div>

                {/* Heading */}
                <h2 className="text-xl font-semibold text-slate-800">
                    Create an account
                </h2>

                <p className="text-sm text-slate-500 mt-1 mb-6">
                    Enter your details to get started.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-5">
                        {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

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
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
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
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500"
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

                        <p className="text-xs text-slate-400 mt-1">
                            Minimum 8 characters.
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>

                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
}
