import axiosInstance from "../../config/axios";

export const consultationTypesApi = {
  // Add consultation type
  addConsultationType: async (data) => {
    const response = await axiosInstance.post("/admin/consultations/add", {
      type_en: data.type_en,
      type_ar: data.type_ar,
      price_usd: data.price_usd,
      price_aed: data.price_aed,
      duration: data.duration,
    });
    return response.data;
  },

  // Update consultation type
  updateConsultationType: async (id, data) => {
    const response = await axiosInstance.put(
      `/admin/consultations/update/${id}`,
      {
        type_en: data.type_en,
        type_ar: data.type_ar,
        price_usd: data.price_usd,
        price_aed: data.price_aed,
        duration: data.duration,
      }
    );
    return response.data;
  },

  // Delete consultation type
  deleteConsultationType: async (id) => {
    const response = await axiosInstance.delete(
      `/admin/consultations/delete/${id}`
    );
    return response.data;
  },

  // Get all consultation types
  getAllConsultationsTypes: async (page = 1, per_page = 5) => {
    const response = await axiosInstance.get("/consultations/get", {
      params: {
        page,
        per_page,
      },
    });
    return response.data;
  },
};

export default consultationTypesApi;
