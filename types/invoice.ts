export type Invoice = {
  id: number;
  customerId: number;
  invoiceNumber: string;
  dueDate: string;
  description: string;
  status: string;
  totalAmount: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  customerId: number;
  dueDate: string;
  description: string;
  status: string;
  totalAmount: string | null;
};

export type PaidInvoices = {
  totalPaid: number;
  totalOverdue: number;
};
