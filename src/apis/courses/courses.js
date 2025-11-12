import axiosInstance from "../../config/axios";


export const coursesApi = {
  // Add course
  addCourse: async (formData) => {
    const response = await axiosInstance.post(
      "/admin/courses/store",
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
    const response = await axiosInstance.get("/courses", {
      params: {
        lang: language,
      },
    });
    return response.data;
  },

  // Get single course by ID
  getCourseById: async (id, language = "en") => {
    const response = await axiosInstance.get(`/courses/${id}`, {
      params: {
        lang: language,
      },
    });
    return response.data;
  },

  // Update course
  updateCourse: async (id, formData) => {
    const response = await axiosInstance.post(
      `/admin/courses/update/${id}`,
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
      `/admin/courses/delete/${id}`
    );
    return response.data;
  },

  // Get users of a course (with pagination)
  getCoursesUsers: async ({ page = 1, per_page = 10, course_id }) => {
    const response = await axiosInstance.get("/admin/users", {
      params: { page, per_page, course_id },
    });
    return response.data;
  },
};
