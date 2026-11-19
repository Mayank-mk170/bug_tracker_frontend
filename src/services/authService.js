
import api from "./api";

// Login API
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Registration API
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Current user API
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
