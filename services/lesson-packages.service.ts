import axiosInstance from "@/config/axios";
import { LessonPackage } from "@/types/lesson-package";

export async function getMyLessonPackages(): Promise<LessonPackage[]> {
  const response = await axiosInstance.get(
    "/api/v2/customer-lesson-packages/my-packages",
  );
  return response.data;
}
