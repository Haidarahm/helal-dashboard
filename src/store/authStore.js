import { create } from "zustand";
import { authApi } from "../apis/auth";

const useAuthStore = create((set) => ({
  loading: false,
  error: null,
  user: null,

  login: async (email, password, setToken) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password);

      // Check if login was successful
      if (response.status === "success" && response.access_token) {
        // Store token in localStorage via context
        if (setToken) {
          setToken(response.access_token);
        }

        set({
          loading: false,
          user: response.user || { email },
          error: null,
        });

        return { success: true, data: response };
      } else {
        const errorMessage = "Login failed. Please try again.";
        set({ loading: false, error: errorMessage, user: null });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";
      set({ loading: false, error: errorMessage, user: null });
      return { success: false, error: errorMessage };
    }
  },

  logout: async (clearToken) => {
    set({ loading: true });
    try {
      // Call logout API
      await authApi.logout();
    } catch (error) {
      // Even if API fails, proceed with logout
      console.error("Logout API error:", error);
    } finally {
      // Clear local state and storage
      set({ user: null, error: null, loading: false });
      if (clearToken) {
        clearToken();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
