import axiosInstance from "../../config/axios";

export const privateCourseInfoApi = {
  // Add lesson information for a private lesson
  addLessonInfo: async (id, payload) => {
    const response = await axiosInstance.post(
      `/admin/private-lesson-information/add/${id}`,
      payload
    );
    return response.data;
  },

  // Update lesson information
  updateLessonInfo: async (id, payload) => {
    const response = await axiosInstance.put(
      `/admin/private-lesson-information/update/${id}`,
      payload
    );
    return response.data;
  },

  // Delete lesson information
  deleteLessonInfo: async (id) => {
    const response = await axiosInstance.delete(
      `/admin/private-lesson-information/delete/${id}`
    );
    return response.data;
  },

  // Get lesson information for a private lesson
  getLessonInfo: async (id) => {
    const response = await axiosInstance.get(
      `/private-lesson-information/${id}`
    );
    return response.data;
  },
};

export default privateCourseInfoApi;
