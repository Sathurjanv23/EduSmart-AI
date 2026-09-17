import { apiRequest } from "./apiService";
import { Student } from "@/app/types/api";

export const getTeacherClasses = () => apiRequest<string[]>("/teacher/classes");
export const getTeacherClassStudents = (classId: string) => apiRequest<Student[]>(`/teacher/classes/${encodeURIComponent(classId)}/students`);
export interface TeacherProfile { id: string; userId: string; name: string; email: string; assignedClassIds: string[]; assignedSubjects: string[]; }
export const getTeacherProfile = () => apiRequest<TeacherProfile>("/teacher/profile");
