import axiosInstance from "../config/axios";

export const liveVideoApi = {
  // Start a live broadcast session
  startBroadcast: async (room_id) => {
    const response = await axiosInstance.post("/broadcast/start", { room_id });
    return response.data;
  },

  // Send a signaling message for the broadcast
  sendSignal: async (room_id, signal) => {
    const response = await axiosInstance.post("/broadcast/signal", {
      room_id,
      signal,
    });
    return response.data;
  },
};
