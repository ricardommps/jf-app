import axiosInstance from "@/config/axios";

export async function getVolume(
  programId: string,
  startDate: string,
  endDate: string
) {
  try {
    const response = await axiosInstance.get(
      `/api/v2/finished/getVolume?programId=${programId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("getVolume", error);
    throw error;
  }
}
