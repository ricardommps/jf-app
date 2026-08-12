// services/strava.service.ts
import axiosInstance from "@/config/axios";

export async function getStravaConnectUrl(redirectUri: string) {
  if (!redirectUri) throw new Error("redirectUri is required");

  try {
    const url = `/api/v2/strava/connect?redirectUri=${encodeURIComponent(redirectUri)}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}

export async function getStravaStatus() {
  try {
    const url = `/api/v2/strava/status`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}

export async function disconnectStrava() {
  try {
    const response = await axiosInstance.delete(`/api/v2/strava/disconnect`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}

export async function getStravaActivities(date: string) {
  if (!date) throw new Error("date is required");

  try {
    const response = await axiosInstance.get("/api/v2/strava/activities", {
      params: { date: String(date) }, // força string pura
    });

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}
