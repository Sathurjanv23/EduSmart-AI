import { apiRequest } from "./apiService";
import { AssessmentType, MarkRecord } from "@/app/types/api";

export interface MarksInput {
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  examId?: string;
  assessmentType?: AssessmentType;
  term?: string;
  comments?: string;
}

export const addMarks = (marks: MarksInput) =>
  apiRequest<MarkRecord>("/marks", { method: "POST", body: marks });

export const updateMarks = (id: string, marks: MarksInput) =>
  apiRequest<MarkRecord>(`/marks/${encodeURIComponent(id)}`, { method: "PUT", body: marks });

export const getAllMarks = () => apiRequest<MarkRecord[]>("/marks");

export const getMyMarks = () => apiRequest<MarkRecord[]>("/marks/me");

export const getMarksByStudent = (studentId: string) =>
  apiRequest<MarkRecord[]>(`/marks/student/${encodeURIComponent(studentId)}`);

export const getMarksByClassAndSubject = (classId: string, subject: string, examId?: string) => {
  const query = examId ? `?examId=${encodeURIComponent(examId)}` : "";
  return apiRequest<MarkRecord[]>(
    `/marks/class/${encodeURIComponent(classId)}/subject/${encodeURIComponent(subject)}${query}`
  );
};
