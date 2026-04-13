export async function markAttendance(attendanceData: {
  studentName: string;
  parentEmail: string;
  date: string;
  status: string;
}) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/attendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(attendanceData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to mark attendance");
  }

  return data;
}

export async function getAllAttendance() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/attendance", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch attendance");
  }

  return data;
}