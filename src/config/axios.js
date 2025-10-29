import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      toast.error("Session expired. Please login again.");
      window.location.href = "/";
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.response?.status >= 400) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An error occurred";
      toast.error(errorMessage);
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
