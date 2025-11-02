import { create } from "zustand";
import { meetingsApi } from "../apis/meetings";
import { toast } from "react-toastify";

const useMeetingsStore = create((set) => ({
  loading: false,
  error: null,
  meetings: [],

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
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch meetings";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default useMeetingsStore;
