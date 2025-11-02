import axiosInstance from "../config/axios";

export const consultationApi = {
  // Get all consultations
  getConsultations: async (page = 1, per_page = 10) => {
    const response = await axiosInstance.get("/api/admin/consultations", {
      params: { page, per_page },
    });
    return response.data;
  },

  // Send response for a consultation
  sendConsultationResponse: async ({
    consultation_id,
    meet_url,
    date,
    time,
  }) => {
    const response = await axiosInstance.post(
      "/api/admin/consultations/response",
      { consultation_id, meet_url, date, time }
    );
    return response.data;
  },
};

export default consultationApi;
