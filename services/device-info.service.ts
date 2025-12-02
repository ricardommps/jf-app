import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export interface DeviceInfoPayload {
  customerId: number;
  info: {
    brand: string;
    model: string;
    uniqueId: string;
    systemVersion: string;
  };
}

export async function deviceInfo(payload: DeviceInfoPayload) {
  try {
    const response = await axiosInstance.post("/api/v2/device-info", payload);
    return response.data;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "deviceInfo",
        payload,
      },
    });
    throw error;
  }
}

export async function getDeviceInfo(customerId: number) {
  try {
    const response = await axiosInstance.get(
      `/api/v2/device-info/${customerId}`
    );
    return response.data;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: "getDeviceInfo",
        customerId,
      },
    });
    throw error;
  }
}
