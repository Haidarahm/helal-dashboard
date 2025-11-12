import axiosInstance from "../../config/axios";

const buildFormData = (fields) => {
  const formData = new FormData();
  const entries = [
    ["name_en", fields.name_en],
    ["name_ar", fields.name_ar],
    ["description_en", fields.description_en],
    ["description_ar", fields.description_ar],
    ["price_aed", fields.price_aed],
    ["price_usd", fields.price_usd],
    ["date", fields.date],
    ["start_time", fields.start_time],
    ["end_time", fields.end_time],
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

export const onlineCoursesApi = {
  // Create online course (multipart)
  createOnlineCourse: async (fields) => {
    const formData = buildFormData(fields);
    const response = await axiosInstance.post("/admin/online-course/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update online course (multipart)
  updateOnlineCourse: async (id, fields) => {
    const formData = buildFormData(fields);
    const response = await axiosInstance.post(
      `/admin/online-course/update/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // Send meeting URL for an online course
  sendMeetingUrl: async (id, meet_url) => {
    const response = await axiosInstance.post(`/admin/online-course/add-meet/${id}`, {
      meet_url,
    });
    return response.data;
  },

  // Delete online course
  deleteOnlineCourse: async (id) => {
    const response = await axiosInstance.delete(`/admin/online-course/delete/${id}`);
    return response.data;
  },

  // Get all online courses with pagination and lang
  getAllOnlineCourses: async ({
    lang = "en",
    page = 1,
    per_page = 10,
  } = {}) => {
    const response = await axiosInstance.get("/courses-online/get", {
      params: { lang, page, per_page },
    });
    return response.data;
  },
};

export default onlineCoursesApi;
