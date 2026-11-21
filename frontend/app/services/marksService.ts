import { apiRequest } from "./apiService";
import { AssessmentType, MarkRecord, PublishMarksInput, PublishMarksResponse } from "@/app/types/api";

export interface MarksInput {
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  examId?: string;
  assessmentType?: AssessmentType;
  term?: string;
  comments?: string;
  assessmentId?: string;
}

export const addMarks = (marks: MarksInput) =>
  apiRequest<MarkRecord>("/marks", { method: "POST", body: marks });

export const updateMarks = (id: string, marks: MarksInput) =>
  apiRequest<MarkRecord>(`/marks/${encodeURIComponent(id)}`, { method: "PUT", body: marks });

export const publishMarks = (payload: PublishMarksInput) =>
  apiRequest<PublishMarksResponse>("/marks/publish", { method: "POST", body: payload });

export const getAllMarks = () => apiRequest<MarkRecord[]>("/marks");

export const getMyMarks = () => apiRequest<MarkRecord[]>("/marks/me");

export const getMarksByStudent = (studentId: string) =>
  apiRequest<MarkRecord[]>(`/marks/student/${encodeURIComponent(studentId)}`);

export const getMarksByClassAndSubject = (
  classId: string,
  subject: string,
  examId?: string,
  assessmentType?: AssessmentType,
  term?: string,
  assessmentId?: string
) => {
  const params = new URLSearchParams();
  if (examId) params.set("examId", examId);
  if (assessmentType) params.set("assessmentType", assessmentType);
  if (term) params.set("term", term);
  if (assessmentId) params.set("assessmentId", assessmentId);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<MarkRecord[]>(
    `/marks/class/${encodeURIComponent(classId)}/subject/${encodeURIComponent(subject)}${query}`
  );
};
