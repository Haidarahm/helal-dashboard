import { create } from "zustand";
import { usersApi } from "../apis/users";
import { toast } from "react-toastify";

const useUsersStore = create((set) => ({
  loading: false,
  error: null,
  users: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },

  fetchUsers: async (page = 1, per_page = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await usersApi.getAllUsers(page, per_page);
      if (response?.status) {
        set({
          loading: false,
          users: response.data || [],
          pagination: response.pagination || {
            current_page: page,
            last_page: page,
            per_page,
            total: Array.isArray(response.data) ? response.data.length : 0,
          },
          error: null,
        });
        return { success: true, data: response };
      }
      const msg = "Failed to fetch users";
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch users";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default useUsersStore;
