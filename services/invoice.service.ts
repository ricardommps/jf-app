import axiosInstance from "@/config/axios";

export async function downloadInvoice(invoiceId: string) {
  try {
    const url = `/api/v2/invoice?invoiceId=${invoiceId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMyInvoices() {
  try {
    const url = `/api/v2/invoice/myInvoices`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("getMyInvoices", error);
    throw error;
  }
}

export async function getTotalPaidInvoices() {
  try {
    const url = `/api/v2/invoice/total-paid`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("getMyInvoices", error);
    throw error;
  }
}
