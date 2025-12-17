import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function getReview(
  programId: string,
  startDate: string,
  endDate: string
) {
  try {
    const response = await axiosInstance.get(
      `/api/v2/finished/getReview?programId=${programId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error: any) {
    // Envia o erro para o Sentry com contexto
    Sentry.captureException(error, {
      extra: { programId, startDate, endDate },
    });
    throw error;
  }
}
