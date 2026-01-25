import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function getPrograms() {
  try {
    const response = await axiosInstance.get("/api/v2/program");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getPrograms" } });
    console.error("getPrograms", error);
    throw error;
  }
}

export async function getProgram(programId: string) {
  try {
    const response = await axiosInstance.get(`/api/v2/program/${programId}`);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getProgram", programId },
    });
    console.error("getProgram", error);
    throw error;
  }
}

export async function runnerProgram() {
  try {
    const response = await axiosInstance.get("/api/v2/program/runnerProgram");
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "runnerProgram" } });
    console.error("runnerProgram", error);
    throw error;
  }
}
