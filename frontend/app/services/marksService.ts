export async function addMarks(marksData: {
  studentName: string;
  parentEmail: string;
  subject: string;
  marks: number;
}) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/marks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(marksData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add marks");
  }

  return data;
}

export async function getAllMarks() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/marks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch marks");
  }

  return data;
}