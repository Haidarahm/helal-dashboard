import { create } from "zustand";
import { privateCoursesApi } from "../apis/courses/privateCourses";
import { toast } from "react-toastify";

const usePrivateCoursesStore = create((set, get) => ({
  loading: false,
  error: null,
  privateLessons: [],
  currentLang: "en",
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },

  // Fetch all private lessons
  fetchPrivateLessons: async ({
    lang = "en",
    page = 1,
    per_page = 10,
  } = {}) => {
    set({ loading: true, error: null, currentLang: lang });
    try {
      const resp = await privateCoursesApi.fetchAllPrivateLessons({
        lang,
        page,
        per_page,
      });
      console.log("Haidar")
      const isOk =
        resp?.status === true ||
        resp?.success === true ||
        resp?.status === "success" ||
        Array.isArray(resp?.data);

      if (isOk) {
        const rawList = resp?.data || resp?.private_lessons || [];
        const list = (Array.isArray(rawList) ? rawList : []).map((it) => ({
          id: it.id,
          title: it.title ?? it.title_en ?? "",
          description: it.description ?? it.description_en ?? "",
          cover_image: it.cover_image ?? it.cover ?? null,
          created_at: it.created_at,
          updated_at: it.updated_at,
          ...it,
        }));
        const pagination = resp?.pagination || {
          current_page: page,
          last_page: page,
          per_page,
          total: Array.isArray(list) ? list.length : 0,
        };
        set({
          loading: false,
          privateLessons: list,
          pagination,
          error: null,
          currentLang: lang,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to fetch private lessons";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch private lessons";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create private lesson
  createPrivateLesson: async (fields) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCoursesApi.createPrivateLesson(fields);
      if (resp?.status || resp?.success) {
        toast.success(resp?.message || "Private lesson created");
        set({ loading: false });
        const { pagination, currentLang } = get();
        await get().fetchPrivateLessons({
          lang: currentLang,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        return { success: true, data: resp };
      }
      const msg =
        resp?.message || resp?.error || "Failed to create private lesson";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create private lesson";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update private lesson
  updatePrivateLesson: async (id, fields) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCoursesApi.updatePrivateLesson(id, fields);
      if (resp?.status || resp?.success) {
        toast.success(resp?.message || "Private lesson updated");
        set({ loading: false });
        const { pagination, currentLang } = get();
        await get().fetchPrivateLessons({
          lang: currentLang,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to update private lesson";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update private lesson";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete private lesson
  deletePrivateLesson: async (id) => {
    set({ loading: true, error: null });
    try {
      const resp = await privateCoursesApi.deletePrivateLesson(id);
      if (resp?.status || resp?.success) {
        toast.success(resp?.message || "Private lesson deleted");
        set({ loading: false });
        const { pagination, currentLang } = get();
        await get().fetchPrivateLessons({
          lang: currentLang,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        return { success: true, data: resp };
      }
      const msg = resp?.message || "Failed to delete private lesson";
      set({ loading: false, error: msg });
      toast.error(msg);
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete private lesson";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));

export default usePrivateCoursesStore;
