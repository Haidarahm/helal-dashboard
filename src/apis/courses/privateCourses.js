import axiosInstance from "../../config/axios";

const buildFormData = (fields) => {
  const formData = new FormData();
  const entries = [
    ["title_en", fields.title_en],
    ["title_ar", fields.title_ar],
    ["description_en", fields.description_en],
    ["description_ar", fields.description_ar],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    formData.append(key, value);
  }
  if (fields.cover_image) {
    formData.append("cover_image", fields.cover_image);
  }
  return formData;
};

export const privateCoursesApi = {
  // Create private lesson
  createPrivateLesson: async (fields) => {
    const formData = buildFormData(fields);
    const response = await axiosInstance.post(
      "/admin/private-lessons",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  // Update private lesson
  updatePrivateLesson: async (id, fields) => {
    const formData = buildFormData(fields);
    const response = await axiosInstance.post(
      `/admin/private-lessons/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // Delete private lesson
  deletePrivateLesson: async (id) => {
    const response = await axiosInstance.delete(`/admin/private-lessons/${id}`);
    return response.data;
  },

  // Fetch all private lessons with pagination and language
  fetchAllPrivateLessons: async ({
    lang = "en",
    page = 1,
    per_page = 10,
  } = {}) => {
    const response = await axiosInstance.get("/private-lessons", {
      params: { lang, page, per_page },
    });
    return response.data;
  },
};

export default privateCoursesApi;
