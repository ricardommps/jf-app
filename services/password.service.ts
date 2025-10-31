import axiosInstance from "@/config/axios";
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/resetPassword";

export async function resetPassword(passwordData: ResetPasswordRequest) {
  const url = `/api/v2/customer/resetPassword`;
  const response = await axiosInstance.patch(url, {
    lastPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
  });
  return response.data as ResetPasswordResponse;
}
