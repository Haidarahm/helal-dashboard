import axiosInstance from "../config/axios";

// Helper to build availability form data
// Accepts array of availability objects: [{ day, start_time, end_time }, ...]
function buildAvailabilityFormData(availabilities) {
  if (!Array.isArray(availabilities) || availabilities.length === 0) {
    throw new Error("Availabilities must be a non-empty array");
  }

  const formData = new FormData();

  availabilities.forEach((availability, index) => {
    if (!availability || typeof availability !== "object") {
      return; // Skip invalid entries
    }

    // Validate required fields
    if (
      !availability.day ||
      !availability.start_time ||
      !availability.end_time
    ) {
      throw new Error(
        `Availability at index ${index} is missing required fields (day, start_time, or end_time)`
      );
    }

    // Day is required
    formData.append(
      `availabilities[${index}][day]`,
      String(availability.day).trim()
    );

    // Start time is required - format as HH:mm (e.g., "16:00")
    const startTime = String(availability.start_time).trim();
    if (!startTime) {
      throw new Error(
        `Start time is required for availability at index ${index}`
      );
    }
    formData.append(`availabilities[${index}][start_time]`, startTime);

    // End time is required - format as HH:mm (e.g., "16:00")
    const endTime = String(availability.end_time).trim();
    if (!endTime) {
      throw new Error(
        `End time is required for availability at index ${index}`
      );
    }
    formData.append(`availabilities[${index}][end_time]`, endTime);
  });

  // Debug: Log FormData contents
  console.log("FormData being sent:");
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  return formData;
}

export const availabilityApi = {
  // Create availabilities
  createAvailability: async (availabilities) => {
    try {
      const formData = buildAvailabilityFormData(availabilities);
      // Axios will automatically detect FormData and set Content-Type with boundary
      // We need to override the default JSON Content-Type
      const response = await axiosInstance.post(
        "/admin/availabilities",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("API Error - Create Availability:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      throw error;
    }
  },

  // Get all availabilities
  getAvailability: async () => {
    const response = await axiosInstance.get("/availabilities");
    return response.data;
  },

  // Delete availability by id
  deleteAvailability: async (id) => {
    const response = await axiosInstance.delete(`/admin/availabilities/${id}`);
    return response.data;
  },
};

export default availabilityApi;
