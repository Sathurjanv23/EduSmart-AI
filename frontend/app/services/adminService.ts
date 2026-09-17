import { apiRequest } from "./apiService";
import { AuthUser, Role } from "./authService";

export interface ProvisionUserInput { name: string; email: string; password: string; role: Role; }
export interface TeacherProfile { id: string; userId: string; name: string; email: string; assignedClassIds: string[]; assignedSubjects: string[]; }

export const provisionUser = (input: ProvisionUserInput) => apiRequest<AuthUser>("/admin/users", { method: "POST", body: input });
export const saveTeacherProfile = (input: { email: string; assignedClassIds: string[]; assignedSubjects: string[] }) => apiRequest<TeacherProfile>("/admin/teachers/profile", { method: "PUT", body: input });
