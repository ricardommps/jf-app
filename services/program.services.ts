import axiosInstance from "@/config/axios";

export async function getPrograms() {
  try {
    const response = await axiosInstance.get("/api/v2/program");
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}
