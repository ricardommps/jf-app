import axiosInstance from "@/config/axios";
import * as Sentry from "@sentry/react-native";

export async function downloadInvoice(invoiceId: string) {
  try {
    const url = `/api/v2/invoice?invoiceId=${invoiceId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "downloadInvoice", invoiceId },
    });
    throw error;
  }
}

export async function getMyInvoices() {
  try {
    const url = `/api/v2/invoice/myInvoices`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, { extra: { context: "getMyInvoices" } });
    throw error;
  }
}

export async function getTotalPaidInvoices() {
  try {
    const url = `/api/v2/invoice/total-paid`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      extra: { context: "getTotalPaidInvoices" },
    });
    throw error;
  }
}
