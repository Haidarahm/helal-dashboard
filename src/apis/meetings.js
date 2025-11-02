import axiosInstance from "../config/axios";

export const meetingsApi = {
  // Get all meetings
  getAllMeetings: async () => {
    const response = await axiosInstance.get("/api/admin/meetings");
    return response.data;
  },
};

export default meetingsApi;
