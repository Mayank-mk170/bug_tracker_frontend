
import { createContext, useContext, useState } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(false);

  // Login
  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await loginUser(credentials);

      if (!["MANAGER", "DEVELOPER"].includes(response.role)) {
        throw new Error("You are not authorized to access this application.");
      }

      const userData = {
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      };

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(response.token);
      setUser(userData);

      return userData;
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const register = async (userData) => {
    setLoading(true);

    try {
      const response = await registerUser(userData);

      return response;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    logoutUser();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
