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

export async function getProgram(programId: string) {
  try {
    const response = await axiosInstance.get(`/api/v2/program/${programId}`);
    return response.data;
  } catch (error) {
    console.error("getPrograms", error);
    throw error;
  }
}
