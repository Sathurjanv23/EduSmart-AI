import { MarkRecord } from "@/app/types/api";

export function calculatePercentage(mark: MarkRecord): number | null {
  const score = mark.marksObtained ?? mark.marks;
  if (score === undefined || score === null) return null;
  if (!mark.totalMarks || mark.totalMarks <= 0) return null;
  return (score / mark.totalMarks) * 100;
}

export function formatScoreDate(isoDate?: string): string {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function exportResultsToCsv(
  studentName: string,
  studentClass: string | undefined,
  marks: MarkRecord[]
): void {
  const headers = [
    "Student Name",
    "Class",
    "Subject",
    "Assessment Type",
    "Term",
    "Score Obtained",
    "Total Marks",
    "Percentage",
    "Published Date",
  ];

  const rows = marks.map((m) => {
    const score = m.marksObtained ?? m.marks;
    const pct = calculatePercentage(m);
    const pctStr = pct !== null ? `${pct.toFixed(1)}%` : "N/A";
    const dateStr = formatScoreDate(m.publishedAt || m.recordedAt);

    return [
      studentName,
      studentClass || "N/A",
      m.subject,
      m.assessmentType || "General Assessment",
      m.term || "N/A",
      score !== undefined ? String(score) : "—",
      m.totalMarks !== undefined ? String(m.totalMarks) : "—",
      pctStr,
      dateStr,
    ];
  });

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitized = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `Academic_Results_${sanitized}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
