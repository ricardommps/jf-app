import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function getTrimp() {
  try {
    const response = await axiosInstance.get("/api/v2/finished/getTrimp");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getTrimp" } });
    throw error;
  }
}
