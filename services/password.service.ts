import axiosInstance from "@/config/axios";
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/resetPassword";
import * as Sentry from "@sentry/react-native";

export async function resetPassword(passwordData: ResetPasswordRequest) {
  const url = `/api/v2/customer/resetPassword`;
  try {
    const response = await axiosInstance.patch(url, {
      lastPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    return response.data as ResetPasswordResponse;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: {
        context: "resetPassword",
        passwordData: { ...passwordData, newPassword: "***" },
      },
    });
    throw error;
  }
}
