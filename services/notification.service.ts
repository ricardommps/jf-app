import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function getNotifications() {
  try {
    const response = await axiosInstance.get("/api/v2/notification");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getNotifications" } });
    throw error;
  }
}

export async function readAtReq(notificationId: number) {
  try {
    const response = await axiosInstance.get(
      `/api/v2/notification/readAt/${notificationId}`
    );
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "readAtReq", notificationId },
    });
    throw error;
  }
}
