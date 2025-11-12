import axiosInstance from "../config/axios";

// Helper to build multipart form data from an object
function buildVideoFormData(fields) {
  const formData = new FormData();

  // Handle course_id separately - it's required and can be 0 (valid ID)
  // Include if it's not undefined, null, or empty string
  // Convert to string for FormData (FormData accepts strings)
  if (
    fields.course_id !== undefined &&
    fields.course_id !== null &&
    fields.course_id !== ""
  ) {
    // Convert to string - handles both numbers (0, 1, etc.) and strings
    formData.append("course_id", String(fields.course_id));
  }

  const entries = [
    ["youtube_path", fields.youtube_path],
    ["title_en", fields.title_en],
    ["title_ar", fields.title_ar],
    ["subTitle_en", fields.subTitle_en],
    ["subTitle_ar", fields.subTitle_ar],
    ["description_en", fields.description_en],
    ["description_ar", fields.description_ar],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    formData.append(key, value);
  }
  // Files: path (video file) and cover (image)
  if (fields.path) formData.append("path", fields.path);
  if (fields.cover) formData.append("cover", fields.cover);
  return formData;
}

export const videosApi = {
  // Create a new video (multipart)
  create: async (fields, options = {}) => {
    const formData = buildVideoFormData(fields);
    const response = await axiosInstance.post("/admin/videos/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: options.onUploadProgress,
    });
    return response.data;
  },

  // Update existing video by id (multipart)
  update: async (id, fields, options = {}) => {
    const formData = buildVideoFormData(fields);
    const response = await axiosInstance.post(
      `/admin/videos/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: options.onUploadProgress,
      }
    );
    return response.data;
  },

  // Delete video by id
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/videos/delete/${id}`);
    return response.data;
  },

  // Get course videos with lang/page/per_page params
  listByCourse: async (
    courseId,
    { lang = "en", page = 1, per_page = 10 } = {}
  ) => {
    const response = await axiosInstance.get(`/courses/${courseId}/videos`, {
      params: { lang, page, per_page },
    });
    return response.data;
  },
};

export default videosApi;
