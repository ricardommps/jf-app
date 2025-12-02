import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function getWorkoutLoad(id: string) {
  try {
    const url = `/api/v2/workout-load/${id}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { id } });
    console.error("getWorkoutLoad error:", error);
    throw error;
  }
}

export async function saveWorkoutLoad(id: string, load: string) {
  try {
    const url = `/api/v2/workout-load/${id}`;
    const response = await axiosInstance.post(url, { load });
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { id, load } });
    console.error("saveWorkoutLoad error:", error);
    throw error;
  }
}
