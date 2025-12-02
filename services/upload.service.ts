import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function uploadFile(formData: any) {
  try {
    const response = await axiosInstance.patch(
      `/api/v2/customer/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // Envia o erro para o Sentry com contexto
    Sentry.captureException(error, { extra: { context: "uploadFile" } });
    console.error("uploadFile error:", error);
    throw error;
  }
}
