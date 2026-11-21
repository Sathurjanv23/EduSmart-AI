import { MarkRecord } from "@/app/types/api";

/**
 * Sanitizes a CSV cell value to prevent CSV Formula Injection (CWE-1236).
 * Prepends a single quote (') if the field begins with formula trigger characters:
 * '=', '+', '-', '@', tab (\t), carriage return (\r), or '%', even if preceded by whitespace.
 */
export function sanitizeCsvValue(val: string): string {
  if (!val) return "";
  const str = String(val);
  if (/^[\s]*[=+\-@\t\r%]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Sanitizes a filename for download while preserving legitimate Unicode/Tamil
 * and international characters across operating systems.
 * Strips filesystem-illegal characters (\ / ? % * : | " < > ~ # control characters).
 */
export function sanitizeFilename(name: string): string {
  if (!name || !name.trim()) return "Student";
  const cleaned = name
    .trim()
    .replace(/[\x00-\x1f\/\\?%*:|"<>~#]/g, "_")
    .replace(/\s+/g, "_");
  return cleaned || "Student";
}

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
  // Defense-in-depth: only export published marks to prevent leaking drafts
  const publishedMarks = marks.filter((m) => !m.status || m.status === "PUBLISHED");

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

  const rows = publishedMarks.map((m) => {
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

  const escapeCsv = (val: string) => `"${sanitizeCsvValue(val).replace(/"/g, '""')}"`;
  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows properly displays Unicode/Tamil characters
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitized = sanitizeFilename(studentName);
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `Academic_Results_${sanitized}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
