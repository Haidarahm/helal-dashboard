import axiosInstance from "../config/axios";

export const authApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/api/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/api/logout");
    return response.data;
  },
};
