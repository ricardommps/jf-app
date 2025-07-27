import axiosInstance from "@/config/axios";

export async function getWorkouts(programId: number, type: number) {
  try {
    const url = `/api/v2/workouts/list?programId=${programId}${
      type === 1 ? "&running=true" : "&running=false"
    }&published=true`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}

export async function getWorkout(workoutId: string) {
  try {
    const url = `/api/v2/workouts/workout?id=${workoutId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}
