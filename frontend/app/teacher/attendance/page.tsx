"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardCheck } from "lucide-react";
import { getClassAttendance, markAttendance } from "@/app/services/attendanceService";
import { getTeacherClasses, getTeacherClassStudents } from "@/app/services/teacherService";
import { AttendanceStatus, Student } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";

type RosterStatus = Exclude<AttendanceStatus, "PENDING">;
const STATUS_OPTIONS: RosterStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(todayLocal);
  const [statuses, setStatuses] = useState<Record<string, RosterStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const roster = useMemo(() => students.filter((student) => student.studentClass === selectedClass), [selectedClass, students]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const assignedClasses = await getTeacherClasses();
      setClasses(assignedClasses);
      setSelectedClass((current) => current || assignedClasses[0] || "");
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not load the class roster.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStudents(); }, [loadStudents]);

  useEffect(() => {
    if (!selectedClass || !date) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getTeacherClassStudents(selectedClass), getClassAttendance(selectedClass, date)])
      .then(([classStudents, records]) => {
        if (!active) return;
        setStudents(classStudents);
        const next: Record<string, RosterStatus> = {};
        records.forEach((record) => {
          if (record.status !== "PENDING") next[record.studentId] = record.status;
        });
        setStatuses(next);
      })
      .catch((unknownError: unknown) => {
        if (active) setError(unknownError instanceof Error ? unknownError.message : "Could not load attendance for this class and date.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, selectedClass]);

  const saveAttendance = async () => {
    if (!selectedClass || roster.length === 0) return;
    const unmarked = roster.filter((student) => !statuses[student.id]);
    if (unmarked.length) {
      setError(`Mark attendance for all ${roster.length} students before saving.`);
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await Promise.all(roster.map((student) => markAttendance({ studentId: student.id, classId: selectedClass, attendanceDate: date, status: statuses[student.id] })));
      setNotice(`Attendance for ${selectedClass} on ${date} was saved.`);
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header><h1 className="flex items-center gap-3 text-3xl font-black"><ClipboardCheck className="h-8 w-8 text-blue-600" />Class attendance</h1><p className="mt-1 text-slate-500">Load a real class roster and record one status per student.</p></header>
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">Class<select value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setNotice(""); }} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"><option value="">Select a class</option>{classes.map((className) => <option key={className}>{className}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-semibold">Date<span className="relative"><CalendarDays className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setNotice(""); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 dark:border-slate-700 dark:bg-slate-800" /></span></label>
      </div>
      {notice && <InlineNotice message={notice} />}
      {error && !loading && <InlineNotice message={error} tone="error" />}
      {loading ? <LoadingState label="Loading class attendance…" /> : error && students.length === 0 ? <ErrorState message={error} onRetry={() => void loadStudents()} /> : !selectedClass ? <EmptyState title="No assigned classes" message="An administrator must assign at least one class to your teacher profile." /> : roster.length === 0 ? <EmptyState title="No students in this class" message="An administrator must assign student profiles to this class before attendance can be recorded." /> : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">{roster.map((student) => <div key={student.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></div><div className="flex flex-wrap gap-2">{STATUS_OPTIONS.map((status) => <button key={status} type="button" onClick={() => setStatuses((current) => ({ ...current, [student.id]: status }))} className={`rounded-lg border px-3 py-2 text-xs font-bold ${statuses[student.id] === status ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:text-slate-300"}`}>{status}</button>)}</div></div>)}</div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{Object.keys(statuses).filter((id) => roster.some((student) => student.id === id)).length} of {roster.length} marked</p><button type="button" onClick={() => void saveAttendance()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><CheckCircle2 className="h-4 w-4" />{saving ? "Saving…" : "Save attendance"}</button></div>
        </section>
      )}
    </div>
  );
}

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
