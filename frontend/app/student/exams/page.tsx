"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, FileText } from "lucide-react";
import { getExamsByClass } from "@/app/services/examService";
import { getCurrentStudent } from "@/app/services/studentService";
import { Exam } from "@/app/types/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const profile = await getCurrentStudent(); setStudentClass(profile.studentClass); const records = await getExamsByClass(profile.studentClass); setExams(records.filter((exam) => exam.status !== "DRAFT")); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load your exams."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  return <div className="mx-auto max-w-5xl space-y-7"><header><h1 className="flex items-center gap-3 text-3xl font-black"><FileText className="h-8 w-8 text-emerald-600" />My exams</h1><p className="mt-1 text-slate-500">Published exams for class {studentClass || "—"}.</p></header>{loading ? <LoadingState label="Loading published exams…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : exams.length === 0 ? <EmptyState title="No published exams" message="There are no published exams for your class yet." /> : <div className="grid gap-5 md:grid-cols-2">{[...exams].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((exam) => <article key={exam.id} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{exam.subject}</p><h2 className="mt-1 text-xl font-black">{exam.title}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">{exam.status}</span></div><p className="mt-3 text-sm text-slate-500">{exam.description || "No description provided."}</p><dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800"><div><dt className="text-xs text-slate-400">Starts</dt><dd className="mt-1 flex items-center gap-1 font-semibold"><CalendarClock className="h-4 w-4" />{formatDateTime(exam.startTime)}</dd></div><div><dt className="text-xs text-slate-400">Marks</dt><dd className="mt-1 font-semibold">{exam.totalMarks} total · {exam.passingMarks} pass</dd></div></dl></article>)}</div>}</div>;
}

function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
