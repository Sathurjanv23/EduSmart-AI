"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, NotebookPen, ShieldCheck, Users } from "lucide-react";
import { getAllAnnouncements } from "@/app/services/announcementService";
import { getAssignments } from "@/app/services/assignmentService";
import { getAllStudents } from "@/app/services/studentService";
import { Announcement, Assignment, Student } from "@/app/types/api";
import { ErrorState, LoadingState } from "@/components/AsyncState";

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]); const [assignments, setAssignments] = useState<Assignment[]>([]); const [announcements, setAnnouncements] = useState<Announcement[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [studentData, assignmentData, announcementData] = await Promise.all([getAllStudents(), getAssignments(), getAllAnnouncements()]); setStudents(studentData); setAssignments(assignmentData); setAnnouncements(announcementData); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load the admin dashboard."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState label="Loading administration data…" />; if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  return <div className="mx-auto max-w-6xl space-y-7"><header><p className="text-sm font-bold text-rose-600">CampusCore administration</p><h1 className="text-3xl font-black">School overview</h1><p className="mt-1 text-slate-500">Counts below come from the live backend; unavailable modules are not estimated.</p></header><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card href="/admin/students" icon={Users} label="Students" value={students.length} /><Card href="/admin/students" icon={ShieldCheck} label="Parent links" value={students.filter((student) => Boolean(student.parentEmail)).length} /><Card href="/admin/exams" icon={NotebookPen} label="Assignments" value={assignments.length} /><Card href="/announcements" icon={BellRing} label="Announcements" value={announcements.length} /></div><section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-lg font-black">Classes represented</h2><div className="mt-4 flex flex-wrap gap-2">{[...new Set(students.map((student) => student.studentClass))].filter(Boolean).map((item) => <span key={item} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{item}</span>)}</div></section></div>;
}

function Card({ href, icon: Icon, label, value }: { href: string; icon: typeof Users; label: string; value: number }) { return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-rose-600" /><p className="mt-3 text-3xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></Link>; }
