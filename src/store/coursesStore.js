import { create } from "zustand";
import { coursesApi } from "../apis/courses/courses";
import { toast } from "react-toastify";

const useCoursesStore = create((set) => ({
  loading: false,
  error: null,
  courses: [],
  language: "en",
  courseUsers: [],
  courseUsersPagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  courseUsersLoading: false,

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

  // Fetch users enrolled in a specific course
  fetchCourseUsers: async (courseId, page = 1, per_page = 10) => {
    set({ courseUsersLoading: true, error: null });
    try {
      const resp = await coursesApi.getCoursesUsers({
        page,
        per_page,
        course_id: courseId,
      });
      if (resp?.status || resp?.data) {
        const users = resp.data || [];
        const pagination = resp.pagination || {
          current_page: page,
          last_page: page,
          per_page,
          total: Array.isArray(users) ? users.length : 0,
        };
        set({
          courseUsersLoading: false,
          courseUsers: users,
          courseUsersPagination: pagination,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to fetch course users";
      set({ courseUsersLoading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch course users";
      set({ courseUsersLoading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCoursesStore;
