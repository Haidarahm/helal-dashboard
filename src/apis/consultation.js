import axiosInstance from "../config/axios";

export const consultationApi = {
  // Get all consultations
  getConsultations: async (page = 1, per_page = 10) => {
    const response = await axiosInstance.get("/admin/consultations", {
      params: { page, per_page },
    });
    return response.data;
  },

  sendConsultationResponse: async ({
    consultation_id,
    meet_url,
    date,
    time,
  }) => {
    const response = await axiosInstance.post(
      "/admin/consultations/response",
      { consultation_id, meet_url, date, time }
    );
    return response.data;
  },
};

export default consultationApi;
