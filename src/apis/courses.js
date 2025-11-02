import axiosInstance from "../config/axios";

/**
 * Courses API
 *
 * Usage example for addCourse:
 * const formData = new FormData();
 * formData.append('title_en', 'English Title');
 * formData.append('title_ar', 'العنوان');
 * formData.append('subTitle_en', 'English Subtitle');
 * formData.append('subTitle_ar', 'العنوان الفرعي');
 * formData.append('description_en', 'English Description');
 * formData.append('description_ar', 'الوصف بالعربي');
 * formData.append('price_aed', '100.00');
 * formData.append('price_usd', '27.00');
 * formData.append('reviews', '5');
 * formData.append('image', imageFile);
 * const result = await coursesApi.addCourse(formData);
 */
export const coursesApi = {
  // Add course
  addCourse: async (formData) => {
    const response = await axiosInstance.post(
      "/api/admin/courses/store",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get all courses with language
  getAllCourses: async (language = "en") => {
    const response = await axiosInstance.get("/api/courses", {
      params: {
        lang: language,
      },
    });
    return response.data;
  },

  // Get single course by ID
  getCourseById: async (id, language = "en") => {
    const response = await axiosInstance.get(`/api/courses/${id}`, {
      params: {
        lang: language,
      },
    });
    return response.data;
  },

  // Update course
  updateCourse: async (id, formData) => {
    const response = await axiosInstance.post(
      `/api/admin/courses/update/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await axiosInstance.delete(
      `/api/admin/courses/delete/${id}`
    );
    return response.data;
  },

  // Get users of a course (with pagination)
  getCoursesUsers: async ({ page = 1, per_page = 10, course_id }) => {
    const response = await axiosInstance.get("/api/admin/users", {
      params: { page, per_page, course_id },
    });
    return response.data;
  },
};
