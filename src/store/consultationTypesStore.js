import { create } from "zustand";
import { consultationTypesApi } from "../apis/consultation/consultationTypes";
import { toast } from "react-toastify";

const useConsultationTypesStore = create((set, get) => ({
  loading: false,
  error: null,
  consultationTypes: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  },

  // Fetch all consultation types
  fetchConsultationTypes: async (page = 1, per_page = 5) => {
    set({ loading: true, error: null });
    try {
      const response = await consultationTypesApi.getAllConsultationsTypes(
        page,
        per_page
      );
      if (response?.status === true || response?.status === "success") {
        set({
          loading: false,
          consultationTypes: response.data || [],
          pagination: response.pagination || {
            current_page: page,
            last_page: page,
            per_page,
            total: 0,
          },
          error: null,
        });
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to fetch consultation types";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch consultation types";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Add consultation type
  addConsultationType: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await consultationTypesApi.addConsultationType(data);
      if (response?.status === true || response?.status === "success") {
        toast.success(
          response?.message || "Consultation type created successfully"
        );
        set({ loading: false });
        // Refresh consultation types after creation
        await get().fetchConsultationTypes(
          get().pagination.current_page,
          get().pagination.per_page
        );
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to create consultation type";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.errors ||
        error?.message ||
        "Failed to create consultation type";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update consultation type
  updateConsultationType: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await consultationTypesApi.updateConsultationType(
        id,
        data
      );
      if (response?.status === true || response?.status === "success") {
        toast.success(
          response?.message || "Consultation type updated successfully"
        );
        set({ loading: false });
        // Refresh consultation types after update
        await get().fetchConsultationTypes(
          get().pagination.current_page,
          get().pagination.per_page
        );
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to update consultation type";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.errors ||
        error?.message ||
        "Failed to update consultation type";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete consultation type
  deleteConsultationType: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await consultationTypesApi.deleteConsultationType(id);
      if (response?.status === true || response?.status === "success") {
        toast.success(
          response?.message || "Consultation type deleted successfully"
        );
        set({ loading: false });
        // Refresh consultation types after deletion
        await get().fetchConsultationTypes(
          get().pagination.current_page,
          get().pagination.per_page
        );
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to delete consultation type";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete consultation type";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default useConsultationTypesStore;
