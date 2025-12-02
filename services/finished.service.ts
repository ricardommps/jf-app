import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function finishedWorkout(payload: any) {
  try {
    const response = await axiosInstance.post("/api/v2/finished", payload);
    return response.data;
  } catch (error: any) {
    // Captura o erro no Sentry com contexto
    Sentry.captureException(error, {
      extra: { context: "finishedWorkout", payload },
    });
    throw error;
  }
}

export async function history() {
  try {
    const response = await axiosInstance.get("/api/v2/finished/history");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "history" } });
    throw error;
  }
}

export async function getFinishedById(id: string) {
  try {
    const response = await axiosInstance.get(`/api/v2/finished/${id}`);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getFinishedById", id },
    });
    throw error;
  }
}
