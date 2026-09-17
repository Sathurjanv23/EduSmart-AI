import { apiRequest } from "./apiService";
import { Exam } from "@/app/types/api";

export const getExamsByClass = (classId: string) => apiRequest<Exam[]>(`/exams/class/${encodeURIComponent(classId)}`);
export type CreateExamInput = Omit<Exam, "id" | "status"> & { description: string };
export const createExam = (input: CreateExamInput) => apiRequest<Exam>("/exams", { method: "POST", body: input });
export const publishExam = (examId: string) => apiRequest<Exam>(`/exams/${encodeURIComponent(examId)}/publish`, { method: "POST" });
