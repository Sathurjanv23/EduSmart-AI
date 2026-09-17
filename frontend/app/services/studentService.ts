import { apiRequest } from "./apiService";
import { Student, StudentProfileInput } from "@/app/types/api";

export const getAllStudents = () => apiRequest<Student[]>("/students");
export const getStudentById = (id: string) => apiRequest<Student>(`/students/${encodeURIComponent(id)}`);
export const getCurrentStudent = () => apiRequest<Student>("/students/me");
export const getParentChildren = () => apiRequest<Student[]>("/parents/children");
export const addStudent = (student: StudentProfileInput) => apiRequest<Student>("/students", { method: "POST", body: student });
export const updateStudent = (id: string, student: StudentProfileInput) => apiRequest<Student>(`/students/${encodeURIComponent(id)}`, { method: "PUT", body: student });
export const deleteStudent = (id: string) => apiRequest<void>(`/students/${encodeURIComponent(id)}`, { method: "DELETE" });
