import { create } from "zustand";
import { newsApi } from "../apis/news";
import { toast } from "react-toastify";

const useNewsStore = create((set) => ({
  loading: false,
  error: null,
  news: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  language: "en",

  // Get all news
  fetchNews: async (language = "en", page = 1, perPage = 10) => {
    set({ loading: true, error: null, language });
    try {
      const response = await newsApi.getAllNews(language, page, perPage);

      if (response.status) {
        set({
          loading: false,
          news: response.data || [],
          pagination: response.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
          },
          error: null,
        });
        return { success: true, data: response };
      } else {
        const errorMessage = "Failed to fetch news";
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch news";
      set({ loading: false, error: errorMessage });
    
      return { success: false, error: errorMessage };
    }
  },

  // Add news
  addNews: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await newsApi.addNews(formData);

      if (response.status || response.success) {
        toast.success("News added successfully");
        set({ loading: false });
        // Refresh news list
        const state = useNewsStore.getState();
        await state.fetchNews(
          state.language,
          state.pagination.current_page,
          state.pagination.per_page
        );
        return { success: true, data: response };
      } else {
        const errorMessage = "Failed to add news";
        set({ loading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add news";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update news
  updateNews: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await newsApi.updateNews(id, formData);

      if (response.status || response.success) {
        toast.success("News updated successfully");
        set({ loading: false });
        // Refresh news list
        const state = useNewsStore.getState();
        await state.fetchNews(
          state.language,
          state.pagination.current_page,
          state.pagination.per_page
        );
        return { success: true, data: response };
      } else {
        const errorMessage = "Failed to update news";
        set({ loading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update news";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete news
  deleteNews: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await newsApi.deleteNews(id);

      toast.success("News deleted successfully");
      set({ loading: false });
      // Refresh news list
      const state = useNewsStore.getState();
      await state.fetchNews(
        state.language,
        state.pagination.current_page,
        state.pagination.per_page
      );
      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete news";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useNewsStore;
