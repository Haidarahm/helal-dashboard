import { create } from "zustand";
import { privateCourseInfoApi } from "../apis/courses/privateCourseInfo";
import { toast } from "react-toastify";

const usePrivateCourseInfoStore = create((set, get) => ({
  loading: false,
  error: null,
  info: null,

  // Fetch info for a private lesson
  fetchLessonInfo: async (id) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCourseInfoApi.getLessonInfo(id);
      if (resp?.status === true || resp?.success === true) {
        // API may return data directly or under data/info
        const data = resp?.data ?? resp?.info ?? resp;
        set({ loading: false, info: data, error: null });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to fetch lesson info";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch lesson info";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Add info (id = private lesson id)
  addLessonInfo: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCourseInfoApi.addLessonInfo(id, payload);
      if (resp?.status === true || resp?.success === true) {
        toast.success(resp?.message || "Lesson info added");
        set({ loading: false });
        await get().fetchLessonInfo(id);
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to add lesson info";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add lesson info";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update info (id = info id per API spec)
  updateLessonInfo: async (id, payload, { refetchLessonId } = {}) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCourseInfoApi.updateLessonInfo(id, payload);
      if (resp?.status === true || resp?.success === true) {
        toast.success(resp?.message || "Lesson info updated");
        set({ loading: false });
        if (refetchLessonId) {
          await get().fetchLessonInfo(refetchLessonId);
        }
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to update lesson info";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update lesson info";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete info (id = info id per API spec)
  deleteLessonInfo: async (id, { refetchLessonId } = {}) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCourseInfoApi.deleteLessonInfo(id);
      if (resp?.status === true || resp?.success === true) {
        toast.success(resp?.message || "Lesson info deleted");
        set({ loading: false });
        if (refetchLessonId) {
          await get().fetchLessonInfo(refetchLessonId);
        } else {
          set({ info: null });
        }
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to delete lesson info";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete lesson info";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default usePrivateCourseInfoStore;
