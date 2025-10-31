import axiosInstance from "@/config/axios";

export async function getWorkoutLoad(id: string) {
  try {
    const url = `/api/v2/workout-load/${id}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}

export async function saveWorkoutLoad(id: string, load: string) {
  try {
    const url = `/api/v2/workout-load/${id}`;
    const response = await axiosInstance.post(url, { load: load });
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}
