import { apiRequest } from "./apiService";
import { AttendanceRecord, AttendanceStatus } from "@/app/types/api";

export interface AttendanceInput {
  studentId: string;
  classId: string;
  status: AttendanceStatus;
  attendanceDate: string;
  remark?: string;
}

export const markAttendance = (record: AttendanceInput) => apiRequest<AttendanceRecord>("/attendance/mark", { method: "POST", body: record });
export const getAllAttendance = () => apiRequest<AttendanceRecord[]>("/attendance");
export const getAttendanceByStudent = (studentId: string) => apiRequest<AttendanceRecord[]>(`/attendance/student/${encodeURIComponent(studentId)}`);
export const getMyAttendance = () => apiRequest<AttendanceRecord[]>("/attendance/me");
export const getClassAttendance = (classId: string, date: string) => apiRequest<AttendanceRecord[]>(`/attendance/class/${encodeURIComponent(classId)}/date/${encodeURIComponent(date)}`);
