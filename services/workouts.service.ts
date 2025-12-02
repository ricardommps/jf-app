import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function getWorkouts(programId: number, type: number) {
  try {
    const url = `/api/v2/workouts/list?programId=${programId}${
      type === 1 ? "&running=true" : "&running=false"
    }&published=true`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { programId, type } });
    console.error("getWorkouts error:", error);
    throw error;
  }
}

export async function getWorkout(workoutId: string) {
  try {
    const url = `/api/v2/workouts/workout?id=${workoutId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { workoutId } });
    console.error("getWorkout error:", error);
    throw error;
  }
}
