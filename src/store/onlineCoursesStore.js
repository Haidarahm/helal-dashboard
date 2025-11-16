import { create } from "zustand";
import { onlineCoursesApi } from "../apis/courses/onlineCourses";
import { toast } from "react-toastify";

const useOnlineCoursesStore = create((set, get) => ({
  loading: false,
  error: null,
  onlineCourses: [],
  currentLang: "ar", // Store current language
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },

  // Fetch all online courses
  fetchOnlineCourses: async ({ lang = "en", page = 1, per_page = 10 } = {}) => {
    set({ loading: true, error: null, currentLang: lang });
    try {
      const resp = await onlineCoursesApi.getAllOnlineCourses({
        lang,
        page,
        per_page,
      });
      if (resp?.status) {
        const list = resp.data || [];
        const pagination = resp.pagination || {
          current_page: page,
          last_page: page,
          per_page,
          total: Array.isArray(list) ? list.length : 0,
        };
        set({
          loading: false,
          onlineCourses: list,
          pagination,
          error: null,
          currentLang: lang,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to fetch online courses";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch online courses";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create online course
  createOnlineCourse: async (fields) => {
    set({ loading: true, error: null });
    try {
      const resp = await onlineCoursesApi.createOnlineCourse(fields);
      if (resp?.status) {
        toast.success(resp?.message || "Online course created");
        set({ loading: false });
        const { pagination, currentLang } = get();
        await get().fetchOnlineCourses({
          lang: currentLang,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.error || "Failed to create online course";
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create online course";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update online course
  updateOnlineCourse: async (id, fields) => {
    set({ loading: true, error: null });
    try {
      const resp = await onlineCoursesApi.updateOnlineCourse(id, fields);
      if (resp?.status) {
        toast.success(resp?.message || "Online course updated");
        set({ loading: false });
        const { pagination, currentLang } = get();
        await get().fetchOnlineCourses({
          lang: currentLang,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to update online course";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update online course";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete online course
  deleteOnlineCourse: async (id) => {
    set({ loading: true, error: null });
    try {
      const resp = await onlineCoursesApi.deleteOnlineCourse(id);
      if (resp?.status || resp?.success) {
        toast.success(resp?.message || "Online course deleted");
        set({ loading: false });
        const { pagination, currentLang } = get();
        await get().fetchOnlineCourses({
          lang: currentLang,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to delete online course";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete online course";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Send meeting URL to a course
  sendMeetingUrl: async (id, meet_url) => {
    set({ loading: true, error: null });
    try {
      const resp = await onlineCoursesApi.sendMeetingUrl(id, meet_url);
      if (resp?.status || resp?.success) {
        toast.success(resp?.message || "Meeting URL saved");
        set({ loading: false });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to save meeting URL";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save meeting URL";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Course users state
  courseUsers: [],
  courseUsersPagination: {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  },
  courseUsersLoading: false,
  currentCourseId: null, // Track current course ID to detect changes

  // Clear course users data
  clearCourseUsers: () => {
    set({
      courseUsers: [],
      courseUsersPagination: {
        current_page: 1,
        last_page: 1,
        per_page: 5,
        total: 0,
      },
      currentCourseId: null,
    });
  },

  // Get users enrolled in an online course
  getOnlineCoursesUsers: async ({
    page = 1,
    per_page = 5,
    course_online_id,
  }) => {
    const { currentCourseId } = get();

    // Clear old data if course ID has changed
    if (currentCourseId !== course_online_id) {
      set({
        courseUsers: [],
        courseUsersPagination: {
          current_page: 1,
          last_page: 1,
          per_page: 5,
          total: 0,
        },
        currentCourseId: course_online_id,
        courseUsersLoading: true,
        error: null,
      });
    } else {
      set({ courseUsersLoading: true, error: null });
    }

    try {
      const resp = await onlineCoursesApi.getOnlineCoursesUsers({
        page,
        per_page,
        course_online_id,
      });
      if (resp?.status) {
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
          currentCourseId: course_online_id,
          error: null,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to fetch course users";
      set({ courseUsersLoading: false, error: msg });
      
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch course users";
      set({ courseUsersLoading: false, error: errorMessage });
 
      return { success: false, error: errorMessage };
    }
  },
}));

export default useOnlineCoursesStore;
