import axiosInstance from "@/config/axios";
import { ActivityDetailsResponse } from "@/types/activity-details";
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

export async function updateFinished(finishedId: string, payload: any) {
  try {
    const response = await axiosInstance.put(
      `/api/v2/finished/edit/${finishedId}`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "updateFinished", finishedId, payload },
    });
    throw error;
  }
}

export async function history() {
  try {
    const response = await axiosInstance.get(
      "/api/v2/finished/historyComments",
    );
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

export async function getFinishedHistory(id: string) {
  try {
    const response = await axiosInstance.get(`/api/v2/finished/history/${id}`);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getFinishedHistory", id },
    });
    throw error;
  }
}

export type FinishedShareData = {
  id: number;
  executionDay: string | null;
  module: { key: string | null; label: string | null };
  title: string | null;
  subtitle: string | null;
  distanceKm: number | null;
  durationInSeconds: number | null;
  durationLabel: string | null;
  paceInSeconds: number | null;
  paceLabel: string | null;
  effort: number | null;
  type: number | null;
};

export async function getFinishedShareData(
  finishedId: string,
): Promise<FinishedShareData> {
  try {
    const response = await axiosInstance.get(
      "/api/v2/finished/share/" + finishedId,
    );
    return response.data as FinishedShareData;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getFinishedShareData", finishedId },
    });
    throw error;
  }
}

export async function getFinishedActivitiesDetails(
  finishedId: string,
): Promise<ActivityDetailsResponse> {
  try {
    const response = await axiosInstance.get(
      `/api/v2/finished/activitiesDetails/${finishedId}`,
    );
    return response.data as ActivityDetailsResponse;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getFinishedActivitiesDetails", finishedId },
    });
    throw error;
  }
}
