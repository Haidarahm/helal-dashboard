import axiosInstance from "../config/axios";

export const meetApi = {
  // Create a meeting
  createMeet: async ({ summary, start_time, duration }) => {
    const response = await axiosInstance.post("/api/admin/create-meet", {
      summary,
      start_time,
      duration,
    });
    return response.data;
  },
};

export default meetApi;
