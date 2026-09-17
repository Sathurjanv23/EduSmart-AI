import { apiRequest } from "./apiService";
import { MarkRecord } from "@/app/types/api";

export interface MarksInput {
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  examId?: string;
}

export const addMarks = (marks: MarksInput) => apiRequest<MarkRecord>("/marks", { method: "POST", body: marks });
export const getAllMarks = () => apiRequest<MarkRecord[]>("/marks");
export const getMyMarks = () => apiRequest<MarkRecord[]>("/marks/me");
export const getMarksByStudent = (studentId: string) => apiRequest<MarkRecord[]>(`/marks/student/${encodeURIComponent(studentId)}`);
