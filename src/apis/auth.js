import axiosInstance from "../config/axios";

export const authApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/logout");
    return response.data;
  },
};
