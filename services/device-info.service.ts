import axiosInstance from "@/config/axios";

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
    console.error("Erro ao enviar informações do dispositivo:", error);
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
    console.error("Erro ao obter informações do dispositivo:", error);
    throw error;
  }
}
