import axiosInstance from "@/config/axios";
import { SendCommentPayload } from "@/types/commnets.type";

export async function sendComment(payload: SendCommentPayload) {
  try {
    const url = `/api/v2/comments`;
    const response = await axiosInstance.post(url, payload);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}

export async function getComments(finishedId: number) {
  try {
    const url = `/api/v2/comments/finished/${finishedId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}

export async function markCommentsAsRead(payload: number[]) {
  try {
    const url = `/api/v2/comments/mark-as-read`;

    const response = await axiosInstance.put(url, {
      commentIds: payload, // 👈 importante (ver abaixo)
    });

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}
