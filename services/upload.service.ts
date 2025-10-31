import axiosInstance from "@/config/axios";
export async function uploadFile(formData: any) {
  try {
    const response = await axiosInstance.patch(
      `/api/v2/customer/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
