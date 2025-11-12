import { create } from "zustand";
import { meetingsApi } from "../apis/meetings";
import { toast } from "react-toastify";

const useMeetingsStore = create((set) => ({
  loading: false,
  error: null,
  meetings: [],
  sending: false,

  fetchMeetings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await meetingsApi.getAllMeetings();
      if (response?.data) {
        set({ loading: false, meetings: response.data, error: null });
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to fetch meetings";
      set({ loading: false, error: msg });
      
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch meetings";
      set({ loading: false, error: errorMessage });
   
      return { success: false, error: errorMessage };
    }
  },

  sendUsersEmailRoom: async (meetingId, userIds = []) => {
    if (!meetingId) {
      toast.error("Please select a meeting first");
      return { success: false, error: "No meeting selected" };
    }
    if (!Array.isArray(userIds) || userIds.length === 0) {
      toast.error("Please select at least one user");
      return { success: false, error: "No users selected" };
    }
    set({ sending: true });
    try {
      const resp = await meetingsApi.sendUsersEmailRoom(meetingId, userIds);
      const ok =
        resp?.status === true || resp?.success === true || !!resp?.message;
      if (ok) {
        toast.success(resp?.message || "Room link sent to users");
        set({ sending: false });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to send room link";
      toast.error(msg);
      set({ sending: false });
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send room link";
      toast.error(errorMessage);
      set({ sending: false });
      return { success: false, error: errorMessage };
    }
  },
}));

export default useMeetingsStore;
