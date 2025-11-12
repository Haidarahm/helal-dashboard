import { create } from "zustand";
import { videosApi } from "../apis/videos";
import { toast } from "react-toastify";

const useVideosStore = create((set, get) => ({
  loading: false,
  error: null,
  videos: [],
  uploadProgress: 0,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  language: "en",
  currentCourseId: null,

  // Clear course videos
  clearCourseVideos: () => {
    set({
      videos: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
      currentCourseId: null,
    });
  },

  // List videos for a course
  fetchCourseVideos: async (
    courseId,
    { lang = "en", page = 1, per_page = 10 } = {}
  ) => {
    const { currentCourseId } = get();

    // Clear old data if course ID has changed
    if (currentCourseId !== courseId && currentCourseId !== null) {
      set({
        videos: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        loading: true,
        error: null,
        language: lang,
        currentCourseId: courseId,
      });
    } else {
      set({
        loading: true,
        error: null,
        language: lang,
        currentCourseId: courseId,
      });
    }

    try {
      const response = await videosApi.listByCourse(courseId, {
        lang,
        page,
        per_page,
      });

      // Normalize to expected backend shape
      const root =
        response?.videos || response?.data?.videos || response?.data || {};
      const list = root?.data || [];
      const meta = root?.meta || {};
      const normalizedPagination = {
        current_page: meta.current_page ?? page,
        last_page: meta.last_page ?? page,
        per_page: meta.per_page ?? per_page,
        total: meta.total ?? (Array.isArray(list) ? list.length : 0),
      };

      if (Array.isArray(list)) {
        set({
          loading: false,
          videos: list,
          pagination: normalizedPagination,
          error: null,
          currentCourseId: courseId,
        });
        return { success: true, data: response };
      }

      const msg = "Failed to fetch course videos";
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch course videos";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create video
  createVideo: async (fields) => {
    set({ loading: true, error: null, uploadProgress: 0 });
    try {
      const resp = await videosApi.create(fields, {
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.round((e.loaded / e.total) * 100);
          set({ uploadProgress: pct });
        },
      });
      toast.success("Video created successfully");
      set({ loading: false, uploadProgress: 0 });
      const { currentCourseId, language, pagination } = get();
      if (currentCourseId) {
        await get().fetchCourseVideos(currentCourseId, {
          lang: language,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
      }
      return { success: true, data: resp };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create video";
      set({ loading: false, error: errorMessage, uploadProgress: 0 });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update video
  updateVideo: async (id, fields) => {
    set({ loading: true, error: null, uploadProgress: 0 });
    try {
      const resp = await videosApi.update(id, fields, {
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.round((e.loaded / e.total) * 100);
          set({ uploadProgress: pct });
        },
      });
      toast.success("Video updated successfully");
      set({ loading: false, uploadProgress: 0 });
      const { currentCourseId, language, pagination } = get();
      if (currentCourseId) {
        await get().fetchCourseVideos(currentCourseId, {
          lang: language,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
      }
      return { success: true, data: resp };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update video";
      set({ loading: false, error: errorMessage, uploadProgress: 0 });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete video
  deleteVideo: async (id) => {
    set({ loading: true, error: null });
    try {
      const resp = await videosApi.delete(id);
      toast.success("Video deleted successfully");
      set({ loading: false });
      const { currentCourseId, language, pagination } = get();
      if (currentCourseId) {
        await get().fetchCourseVideos(currentCourseId, {
          lang: language,
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
      }
      return { success: true, data: resp };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete video";
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useVideosStore;
