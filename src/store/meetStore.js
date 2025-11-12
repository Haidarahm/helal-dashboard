import { create } from "zustand";
import { meetApi } from "../apis/meet";
import { toast } from "react-toastify";

const useMeetStore = create((set) => ({
  loading: false,
  error: null,
  lastMeeting: null,

  createMeeting: async ({ summary, start_time, duration }) => {
    set({ loading: true, error: null });
    try {
      const resp = await meetApi.createMeet({ summary, start_time, duration });
      const ok =
        !!resp?.meet_url || resp?.status === true || resp?.success === true;
      if (ok) {
        set({ loading: false, lastMeeting: resp });
        toast.success(resp?.message || "Meeting created successfully");
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to create meeting";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.message ||
        "Failed to create meeting";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default useMeetStore;
