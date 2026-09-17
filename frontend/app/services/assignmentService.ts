import { apiRequest } from "./apiService";
import { Assignment, AssignmentSubmission, UploadResponse } from "@/app/types/api";

export interface CreateAssignmentInput {
  title: string;
  description: string;
  classId: string;
  subject: string;
  dueDate: string;
  maxMarks: number;
}

export const getAssignments = () => apiRequest<Assignment[]>("/assignments");
export const getAvailableAssignments = () => apiRequest<Assignment[]>("/assignments/available");
export const getAssignmentsByStudent = (studentId: string) => apiRequest<Assignment[]>(`/assignments/student/${encodeURIComponent(studentId)}`);
export const getMySubmissions = () => apiRequest<AssignmentSubmission[]>("/assignments/submissions/mine");
export const createAssignment = (input: CreateAssignmentInput) => apiRequest<Assignment>("/assignments", { method: "POST", body: input });
export const submitAssignment = (input: { assignmentId: string; submissionText?: string; submissionFileUrl?: string }) => apiRequest<AssignmentSubmission>("/assignments/submissions", { method: "POST", body: input });
export const getAssignmentSubmissions = (assignmentId: string) => apiRequest<AssignmentSubmission[]>(`/assignments/submissions/assignment/${encodeURIComponent(assignmentId)}`);
export const gradeSubmission = (submissionId: string, input: { marks: number; feedback: string }) => apiRequest<AssignmentSubmission>(`/assignments/submissions/${encodeURIComponent(submissionId)}/grade`, { method: "PATCH", body: input });
export const uploadAssignmentFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<UploadResponse>("/upload", { method: "POST", body: formData });
};
