import { apiRequest } from "./apiService";

export async function markAttendance(attendanceData: {
  studentName: string;
  parentEmail: string;
  date: string;
  status: string;
}) {
  return apiRequest("/attendance", {
    method: "POST",
    body: JSON.stringify(attendanceData),
  });
}

export async function getAllAttendance() {
  return apiRequest("/attendance", {
    method: "GET",
  });
}

export async function getAttendanceByStudent(studentId: string) {
  return apiRequest(`/attendance/student/${studentId}`, {
    method: "GET",
  });
}