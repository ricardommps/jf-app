import axiosInstance from "@/config/axios";
import { UserType } from "@/types/ProfileType";
import * as Sentry from "@sentry/react-native";

export async function getMyProfile(): Promise<UserType> {
  try {
    const response = await axiosInstance.get("/api/v2/customer/me");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getMyProfile" } });
    console.error("getMyProfile", error);
    throw error;
  }
}
