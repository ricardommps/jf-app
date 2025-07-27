import axiosInstance from "@/config/axios";

export async function finishedWorkout(payload: any) {
  try {
    const response = await axiosInstance.post("/api/v2/finished", payload);
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}
