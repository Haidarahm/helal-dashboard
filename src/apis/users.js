import axiosInstance from "../config/axios";

export const usersApi = {
  // Get all users with pagination
  getAllUsers: async (page = 1, per_page = 10) => {
    const response = await axiosInstance.get("/admin/users", {
      params: { page, per_page },
    });
    return response.data;
  },
};

export default usersApi;
