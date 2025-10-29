import axiosInstance from "../config/axios";

/**
 * News API
 *
 * Usage example for addNews:
 * const formData = new FormData();
 * formData.append('title_en', 'English Title');
 * formData.append('title_ar', 'العنوان');
 * formData.append('subtitle_en', 'English Subtitle');
 * formData.append('subtitle_ar', 'العنوان الفرعي');
 * formData.append('description_en', 'English Description');
 * formData.append('description_ar', 'الوصف بالعربي');
 * // Append multiple images
 * files.forEach(file => {
 *   formData.append('image[]', file);
 * });
 * const result = await newsApi.addNews(formData);
 */
export const newsApi = {
  // Add news
  addNews: async (formData) => {
    const response = await axiosInstance.post("/api/news-sections", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all news with pagination and language
  getAllNews: async (language = "en", page = 1, perPage = 10) => {
    const response = await axiosInstance.get("/api/news-sections", {
      params: {
        lang: language,
        page: page,
        per_page: perPage,
      },
    });
    return response.data;
  },

  // Get single news by ID
  getNewsById: async (id, language = "en") => {
    const response = await axiosInstance.get(`/api/news-sections/${id}`, {
      params: {
        lang: language,
      },
    });
    return response.data;
  },

  // Update news
  updateNews: async (id, formData) => {
    const response = await axiosInstance.post(
      `/api/news-sections/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete news
  deleteNews: async (id) => {
    const response = await axiosInstance.delete(`/api/news-sections/${id}`);
    return response.data;
  },
};
