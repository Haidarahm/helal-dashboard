import { create } from "zustand";
import { coursesApi } from "../apis/courses";
import { toast } from "react-toastify";

const useCoursesStore = create((set) => ({
  loading: false,
  error: null,
  courses: [],
  language: "en",

  // Get all courses
  fetchCourses: async (language = "en") => {
    set({ loading: true, error: null, language });
    try {
      const response = await coursesApi.getAllCourses(language);

      if (response.status === "success") {
        set({
          loading: false,
          courses: response.courses || [],
          error: null,
        });
        return { success: true, data: response };
      } else {
        const errorMessage = response.message || "Failed to fetch courses";
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch courses";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Add course
  addCourse: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await coursesApi.addCourse(formData);

      if (response.status === "success" || response.success) {
        toast.success("Course added successfully");
        // Refresh courses list
        const state = useCoursesStore.getState();
        await state.fetchCourses(state.language);
        set({ loading: false });
        return { success: true, data: response };
      } else {
        const errorMessage = response.message || "Failed to add course";
        set({ loading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add course";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update course
  updateCourse: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await coursesApi.updateCourse(id, formData);

      if (response.status === "success" || response.success) {
        toast.success("Course updated successfully");
        // Refresh courses list
        const state = useCoursesStore.getState();
        await state.fetchCourses(state.language);
        set({ loading: false });
        return { success: true, data: response };
      } else {
        const errorMessage = response.message || "Failed to update course";
        set({ loading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update course";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await coursesApi.deleteCourse(id);

      toast.success("Course deleted successfully");
      // Refresh courses list
      const state = useCoursesStore.getState();
      await state.fetchCourses(state.language);
      set({ loading: false });
      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete course";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCoursesStore;
