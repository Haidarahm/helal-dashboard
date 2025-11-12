import axiosInstance from "../config/axios";

export const meetingsApi = {
  // Get all meetings
  getAllMeetings: async () => {
    const response = await axiosInstance.get("/admin/meetings");
    return response.data;
  },
  // Send emails to selected users for a specific meeting
  sendUsersEmailRoom: async (meetingId, user_ids) => {
    const response = await axiosInstance.post(
      `/admin/send-meet-emails/${meetingId}`,
      { user_ids }
    );
    return response.data;
  },
};

export default meetingsApi;
