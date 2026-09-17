"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, CalendarCheck, CreditCard, NotebookPen } from "lucide-react";
import { getAvailableAssignments } from "@/app/services/assignmentService";
import { getMyAttendance } from "@/app/services/attendanceService";
import { getMyFeeSummary } from "@/app/services/financeService";
import { getMyMarks } from "@/app/services/marksService";
import { getCurrentStudent } from "@/app/services/studentService";
import { Assignment, AttendanceRecord, FeeSummary, MarkRecord, Student } from "@/app/types/api";
import { ErrorState, LoadingState } from "@/components/AsyncState";

export default function StudentDashboardPage() {
  const [data, setData] = useState<{ profile: Student; attendance: AttendanceRecord[]; marks: MarkRecord[]; assignments: Assignment[]; fees: FeeSummary } | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [profile, attendance, marks, assignments, fees] = await Promise.all([getCurrentStudent(), getMyAttendance(), getMyMarks(), getAvailableAssignments(), getMyFeeSummary()]); setData({ profile, attendance, marks, assignments, fees }); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load your dashboard."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const attendancePercentage = useMemo(() => { const records = data?.attendance.filter((item) => item.status !== "PENDING") || []; return records.length ? Math.round((records.filter((item) => item.status === "PRESENT" || item.status === "LATE").length / records.length) * 100) : null; }, [data]);
  const marksAverage = useMemo(() => { const values = data?.marks.map((item) => { const score = item.marksObtained ?? item.marks; return score === undefined ? null : item.totalMarks ? score / item.totalMarks * 100 : score; }).filter((item): item is number => item !== null) || []; return values.length ? Math.round(values.reduce((sum, item) => sum + item, 0) / values.length) : null; }, [data]);
  if (loading) return <LoadingState label="Loading your dashboard…" />; if (error || !data) return <ErrorState message={error || "Student profile unavailable."} onRetry={() => void load()} />;
  return <div className="mx-auto max-w-6xl space-y-7"><header><p className="text-sm font-bold text-emerald-600">Class {data.profile.studentClass}</p><h1 className="text-3xl font-black">Welcome, {data.profile.name}</h1><p className="mt-1 text-slate-500">A live overview of your academic records.</p></header><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card href="/student/attendance" icon={CalendarCheck} label="Attendance" value={attendancePercentage === null ? "—" : `${attendancePercentage}%`} /><Card href="/student/marks" icon={Award} label="Marks average" value={marksAverage === null ? "—" : `${marksAverage}%`} /><Card href="/student/assignments" icon={NotebookPen} label="Available assignments" value={data.assignments.length} /><Card href="/student/fees" icon={CreditCard} label="Outstanding fees" value={money(data.fees.outstandingBalance, data.fees.currency)} /></div><section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-lg font-black">Upcoming assignments</h2>{data.assignments.length ? <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{data.assignments.slice(0, 5).map((assignment) => <div key={assignment.id} className="flex justify-between gap-4 py-3"><div><p className="font-semibold">{assignment.title}</p><p className="text-xs text-slate-500">{assignment.subject}</p></div><p className="text-xs text-slate-500">Due {new Date(assignment.dueDate).toLocaleDateString()}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No assignments are currently available.</p>}</section></div>;
}

function Card({ href, icon: Icon, label, value }: { href: string; icon: typeof Award; label: string; value: string | number }) { return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></Link>; }
function money(value: number, currency: string) { try { return new Intl.NumberFormat("en-LK", { style: "currency", currency }).format(value); } catch { return `${currency} ${value.toFixed(2)}`; } }
