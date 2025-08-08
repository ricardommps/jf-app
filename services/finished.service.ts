import axiosInstance from "@/config/axios";

export async function finishedWorkout(payload: any) {
  try {
    const response = await axiosInstance.post("/api/v2/finished", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function history() {
  try {
    const response = await axiosInstance.get("/api/v2/finished/history");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getFinishedById(id: string) {
  try {
    const response = await axiosInstance.get(`/api/v2/finished/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
