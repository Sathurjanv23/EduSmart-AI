import { apiRequest } from "./apiService";

export async function getAllStudents() {
  return apiRequest("/students", {
    method: "GET",
  });
}

export async function getStudentById(id: string) {
  return apiRequest(`/students/${id}`, {
    method: "GET",
  });
}

export async function addStudent(studentData: any) {
  return apiRequest("/students", {
    method: "POST",
    body: JSON.stringify(studentData),
  });
}