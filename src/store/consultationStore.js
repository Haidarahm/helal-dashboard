import { create } from "zustand";
import { consultationApi } from "../apis/consultation";
import { toast } from "react-toastify";

const useConsultationStore = create((set) => ({
  loading: false,
  error: null,
  consultations: [],
  sending: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },

  fetchConsultations: async (page = 1, per_page = 10) => {
    set({ loading: true, error: null });
    try {
      const resp = await consultationApi.getConsultations(page, per_page);
      if (resp?.data) {
        const pagination = resp.pagination || {
          current_page: page,
          last_page: page,
          per_page,
          total: Array.isArray(resp.data) ? resp.data.length : 0,
        };
        set({
          loading: false,
          consultations: resp.data,
          pagination,
          error: null,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to fetch consultations";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch consultations";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  sendConsultationResponse: async ({
    consultation_id,
    meet_url,
    date,
    time,
  }) => {
    if (!consultation_id || !meet_url || !date || !time) {
      toast.error("Please fill consultation, link, date and time");
      return { success: false, error: "Missing fields" };
    }
    set({ sending: true });
    try {
      const resp = await consultationApi.sendConsultationResponse({
        consultation_id,
        meet_url,
        date,
        time,
      });
      const ok =
        resp?.status === true || resp?.success === true || !!resp?.message;
      if (ok) {
        toast.success(resp?.message || "Consultation response sent");
        set({ sending: false });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to send consultation response";
      toast.error(msg);
      set({ sending: false });
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send consultation response";
      toast.error(errorMessage);
      set({ sending: false });
      return { success: false, error: errorMessage };
    }
  },
}));

export default useConsultationStore;
