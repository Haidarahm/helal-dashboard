import { create } from "zustand";
import { availabilityApi } from "../apis/availability";
import { toast } from "react-toastify";

const useAvailabilityStore = create((set, get) => ({
  loading: false,
  error: null,
  availabilities: [],

  // Fetch all availabilities
  fetchAvailabilities: async () => {
    set({ loading: true, error: null });
    try {
      const response = await availabilityApi.getAvailability();
      if (response?.status === "success" || response?.status === true) {
        const availabilities = response.Availabilities || response.data || [];
        set({
          loading: false,
          availabilities: Array.isArray(availabilities) ? availabilities : [],
          error: null,
        });
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to fetch availabilities";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch availabilities";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create availabilities
  createAvailability: async (availabilities) => {
    set({ loading: true, error: null });
    try {
      const response = await availabilityApi.createAvailability(availabilities);

      // Check for success response
      if (response?.status === "success" || response?.status === true) {
        toast.success(
          response?.message || "Availabilities created successfully"
        );
        set({ loading: false });
        // Refresh availabilities after creation
        await get().fetchAvailabilities();
        return { success: true, data: response };
      }

      // Handle error response
      const msg =
        response?.message ||
        response?.error ||
        "Failed to create availabilities";

      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      // Log detailed error information
      console.error("Error creating availability:", error);
      console.error("Error response data:", error?.response?.data);
      console.error("Error response status:", error?.response?.status);

      // Extract error message from various possible locations
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.errors ||
        (error?.response?.data?.data &&
          JSON.stringify(error?.response?.data?.data)) ||
        error?.message ||
        "Failed to create availabilities";

      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete availability
  deleteAvailability: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await availabilityApi.deleteAvailability(id);
      if (
        response?.status === "success" ||
        response?.status === true ||
        response?.success
      ) {
        toast.success(response?.message || "Availability deleted successfully");
        set({ loading: false });
        // Refresh availabilities after deletion
        await get().fetchAvailabilities();
        return { success: true, data: response };
      }
      const msg = response?.message || "Failed to delete availability";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete availability";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default useAvailabilityStore;
