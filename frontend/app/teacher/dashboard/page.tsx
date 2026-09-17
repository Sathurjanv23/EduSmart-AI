"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, FileText, NotebookPen, Users } from "lucide-react";
import { getAssignments } from "@/app/services/assignmentService";
import { getExamsByClass } from "@/app/services/examService";
import { getTeacherClassStudents, getTeacherProfile, TeacherProfile } from "@/app/services/teacherService";
import { Assignment, Exam } from "@/app/types/api";
import { ErrorState, LoadingState } from "@/components/AsyncState";

export default function TeacherDashboardPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null); const [studentCount, setStudentCount] = useState(0); const [assignments, setAssignments] = useState<Assignment[]>([]); const [exams, setExams] = useState<Exam[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const teacher = await getTeacherProfile(); setProfile(teacher); const [assignmentData, rosters, examLists] = await Promise.all([getAssignments(), Promise.all(teacher.assignedClassIds.map(getTeacherClassStudents)), Promise.all(teacher.assignedClassIds.map(getExamsByClass))]); setAssignments(assignmentData); setStudentCount(new Set(rosters.flat().map((student) => student.id)).size); setExams(examLists.flat()); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load your dashboard."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState label="Loading teacher dashboard…" />; if (error || !profile) return <ErrorState message={error || "Teacher profile unavailable."} onRetry={() => void load()} />;
  return <div className="mx-auto max-w-6xl space-y-7"><header><p className="text-sm font-bold text-blue-600">{profile.assignedSubjects.join(" · ") || "No subjects assigned"}</p><h1 className="text-3xl font-black">Welcome, {profile.name}</h1><p className="mt-1 text-slate-500">Live information restricted to your assigned classes.</p></header><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card href="/teacher/attendance" icon={ClipboardCheck} label="Assigned classes" value={profile.assignedClassIds.length} /><Card href="/teacher/attendance" icon={Users} label="Students" value={studentCount} /><Card href="/teacher/assignments" icon={NotebookPen} label="Assignments" value={assignments.length} /><Card href="/teacher/exams" icon={FileText} label="Exams" value={exams.length} /></div><section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-lg font-black">Assigned classes</h2><div className="mt-4 flex flex-wrap gap-2">{profile.assignedClassIds.length ? profile.assignedClassIds.map((item) => <span key={item} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item}</span>) : <p className="text-sm text-slate-500">Ask an administrator to assign classes.</p>}</div></section></div>;
}

function Card({ href, icon: Icon, label, value }: { href: string; icon: typeof Users; label: string; value: number }) { return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-3 text-3xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></Link>; }
