import { apiRequest } from "./apiService";
import { FeeSummary, FeeTransaction } from "@/app/types/api";

export const getFeeStructures = () => apiRequest<unknown[]>("/fee-structure");
export const getDuesForStudent = (studentId: string) => apiRequest<FeeTransaction[]>(`/fee-transactions/student/${encodeURIComponent(studentId)}`);
export const getMyFeeTransactions = () => apiRequest<FeeTransaction[]>("/fee-transactions/me");
export const getMyFeeSummary = () => apiRequest<FeeSummary>("/fee-transactions/summary");
export const getFeeSummaryForStudent = (studentId: string) => apiRequest<FeeSummary>(`/fee-transactions/student/${encodeURIComponent(studentId)}/summary`);

/** Server-recorded payments are an administrator workflow, not a client-side claim of payment. */
export interface RecordPaymentInput {
  studentId: string;
  feeStructureId: string;
  amount: number;
  paidAmount: number;
  paymentMode: "CASH" | "CHEQUE" | "ONLINE" | "TEST";
  paymentGateway?: string;
  transactionId?: string;
  dueDate?: string;
}

export const recordVerifiedPayment = (payment: RecordPaymentInput) => apiRequest<FeeTransaction>("/fee-transactions", { method: "POST", body: payment });
