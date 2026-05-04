import { apiRequest } from "./apiService";

export async function getAllExams() {
  return apiRequest("/exams", {
    method: "GET",
  });
}

export async function postMarks(marksData: any) {
  return apiRequest("/marks", {
    method: "POST",
    body: JSON.stringify(marksData),
  });
}

export async function getReportCard(studentId: string) {
  return apiRequest(`/report-cards/student/${studentId}`, {
    method: "GET",
  });
}
