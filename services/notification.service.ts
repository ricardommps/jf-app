import axiosInstance from "@/config/axios";

export async function getNotifications() {
  try {
    const response = await axiosInstance.get("/api/v2/notification");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function readAtReq(notificationId: number) {
  try {
    const response = await axiosInstance.get(
      `/api/v2/notification/readAt/${notificationId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
