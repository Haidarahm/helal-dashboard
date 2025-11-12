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
    const status = error.response?.status;
    const reqUrl = error.config?.url || "";
    if (status === 401) {
      // Do not redirect on login attempt; let caller handle invalid credentials
      if (reqUrl.includes("/api/login")) {
        return Promise.reject(error);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      toast.error("Session expired. Please login again.");
      window.location.href = "/";
      return Promise.reject(error);
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
   
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
