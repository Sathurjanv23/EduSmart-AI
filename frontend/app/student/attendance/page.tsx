"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { getMyAttendance } from "@/app/services/attendanceService";
import { AttendanceRecord } from "@/app/types/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setRecords(await getMyAttendance()); }
    catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load your attendance."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadAttendance(); }, [loadAttendance]);

  const summary = useMemo(() => {
    const counted = records.filter((record) => record.status !== "PENDING");
    const present = counted.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
    return { total: counted.length, present, absent: counted.filter((record) => record.status === "ABSENT").length, late: counted.filter((record) => record.status === "LATE").length, percentage: counted.length ? Math.round((present / counted.length) * 100) : 0 };
  }, [records]);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header><h1 className="flex items-center gap-3 text-3xl font-black"><CalendarCheck className="h-8 w-8 text-emerald-600" />My attendance</h1><p className="mt-1 text-slate-500">Attendance recorded for your authenticated student profile.</p></header>
      {loading ? <LoadingState label="Loading your attendance…" /> : error ? <ErrorState message={error} onRetry={() => void loadAttendance()} /> : records.length === 0 ? <EmptyState title="No attendance recorded" message="Your attendance history will appear after a teacher records it." /> : <>
        <div className="grid gap-4 sm:grid-cols-4"><Stat label="Attendance" value={`${summary.percentage}%`} icon={CalendarCheck} /><Stat label="Days counted" value={summary.total} icon={CheckCircle2} /><Stat label="Absent" value={summary.absent} icon={XCircle} /><Stat label="Late" value={summary.late} icon={Clock3} /></div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Remark</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{[...records].sort((a, b) => (b.attendanceDate || b.date || "").localeCompare(a.attendanceDate || a.date || "")).map((record, index) => <tr key={record.id || `${record.attendanceDate}-${index}`}><td className="px-5 py-4">{formatDate(record.attendanceDate || record.date)}</td><td className="px-5 py-4">{record.classId}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(record.status)}`}>{record.status}</span></td><td className="px-5 py-4 text-slate-500">{record.remark || "—"}</td></tr>)}</tbody></table></div></section>
      </>}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof CalendarCheck }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-black">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>; }
function statusStyle(status: string) { if (status === "PRESENT") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"; if (status === "ABSENT") return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"; return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"; }
function formatDate(value?: string) { if (!value) return "—"; const date = new Date(`${value.slice(0, 10)}T00:00:00`); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(); }
