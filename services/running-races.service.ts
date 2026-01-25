import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export type RunningRaces = {
  programId: number;
  subtitle: string;
  distance: number;
  link: string;
  datePublished: string;
};

export async function runningRaces(programId: string) {
  try {
    const response = await axiosInstance.get(
      `/api/v2/workouts/runningRaces?programId=${programId}`
    );
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { programId },
    });
    console.error("runningRaces error:", error);
    throw error;
  }
}

export async function createRunningRaces(payload: RunningRaces) {
  try {
    const runningRacesPayload = {
      ...payload,
      title: "COMPETICAO",
      published: true,
      hide: false,
      finished: false,
      running: true,
      heating: "",
      recovery: "",
      description: "",
      workoutDateOther: null,
      displayOrder: null,
      workoutItems: [],
    };
    const response = await axiosInstance.post(
      "api/v2/workouts/createRunningRaces",
      runningRacesPayload
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function updateRunningRaces(
  workoutId: string,
  payload: Partial<RunningRaces> & Record<string, any>
) {
  try {
    const response = await axiosInstance.put(
      `/api/v2/workouts/updateRunningRaces?workoutId=${workoutId}`,
      payload
    );

    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { workoutId, payload },
    });

    console.error("updateWorkout error:", error);
    throw error;
  }
}

export async function deleteRunningRaces(workoutId: string) {
  try {
    const response = await axiosInstance.delete(
      `/api/v2/workouts/deleteRunningRaces?workoutId=${workoutId}`
    );
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getTrimp" } });
    throw error;
  }
}
