"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { GraduationCap, Search, Trash2, UserPlus, Users, X } from "lucide-react";
import { addStudent, deleteStudent, getAllStudents } from "@/app/services/studentService";
import { Student, StudentGender } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";

type StudentForm = { name: string; email: string; parentEmail: string; studentClass: string; gender: "" | StudentGender };
const EMPTY_FORM: StudentForm = { name: "", email: "", parentEmail: "", studentClass: "", gender: "" };

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStudents(await getAllStudents());
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStudents(); }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) => [student.name, student.email, student.parentEmail, student.studentClass, student.id].some((value) => value?.toLowerCase().includes(term)));
  }, [query, students]);

  const submitStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const created = await addStudent({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        parentEmail: form.parentEmail.trim() ? form.parentEmail.trim().toLowerCase() : null,
        studentClass: form.studentClass.trim(),
        gender: form.gender || null,
      });
      setStudents((current) => [created, ...current]);
      setForm(EMPTY_FORM);
      setModalOpen(false);
      setNotice(`${created.name} was added successfully.`);
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not add the student.");
    } finally {
      setSaving(false);
    }
  };

  const removeStudent = async (student: Student) => {
    if (!window.confirm(`Delete ${student.name}'s student profile? Their login account will remain active.`)) return;
    setError("");
    try {
      await deleteStudent(student.id);
      setStudents((current) => current.filter((item) => item.id !== student.id));
      setNotice(`${student.name}'s student profile was deleted. The login account was not removed.`);
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not delete the student.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="flex items-center gap-3 text-3xl font-black"><Users className="h-8 w-8 text-rose-600" />Student directory</h1><p className="mt-1 text-slate-500">Manage real student profiles and parent links.</p></div>
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-500"><UserPlus className="h-5 w-5" />New student</button>
      </header>

      {notice && <InlineNotice message={notice} />}
      <InlineNotice tone="info" message="A STUDENT login account must exist before its profile can be added here. Use User Accounts to provision new accounts." />
      {error && !loading && <InlineNotice message={error} tone="error" />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Students" value={students.length} />
        <Stat label="Classes represented" value={new Set(students.map((student) => student.studentClass)).size} />
        <Stat label="Parent links" value={students.filter((student) => Boolean(student.parentEmail)).length} />
      </div>

      <label className="relative block">
        <span className="sr-only">Search students</span><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, ID, class, email, or parent email" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-900" />
      </label>

      {loading ? <LoadingState label="Loading student records…" /> : error && students.length === 0 ? <ErrorState message={error} onRetry={() => void loadStudents()} /> : filteredStudents.length === 0 ? <EmptyState title={query ? "No matching students" : "No students yet"} message={query ? "Try a different search term." : "Add the first student to begin the academic workflow."} /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <article key={student.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-xl font-black text-rose-600 dark:bg-rose-950">{student.name.charAt(0).toUpperCase()}</div><button type="button" onClick={() => void removeStudent(student)} aria-label={`Delete ${student.name}'s student profile`} title="Delete profile only" className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button></div>
              <h2 className="mt-4 text-lg font-bold">{student.name}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><GraduationCap className="h-4 w-4" />Class {student.studentClass || "Not assigned"}</p>
              <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800"><div><dt className="text-xs text-slate-400">Student email</dt><dd className="break-all">{student.email}</dd></div><div><dt className="text-xs text-slate-400">Parent email</dt><dd className="break-all">{student.parentEmail || "Not linked"}</dd></div><div><dt className="text-xs text-slate-400">Record ID</dt><dd className="break-all font-mono text-xs">{student.id}</dd></div></dl>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="student-dialog-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between"><h2 id="student-dialog-title" className="text-xl font-black">Add student</h2><button type="button" onClick={() => setModalOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            <form onSubmit={submitStudent} className="mt-6 grid gap-4">
              <Field label="Full name"><input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field" /></Field>
              <Field label="Student email"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field" /></Field>
              <Field label="Parent email (optional)"><input type="email" value={form.parentEmail} onChange={(event) => setForm({ ...form, parentEmail: event.target.value })} className="field" /></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Class"><input required placeholder="10-A" value={form.studentClass} onChange={(event) => setForm({ ...form, studentClass: event.target.value })} className="field" /></Field><Field label="Gender (optional)"><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as StudentForm["gender"] })} className="field"><option value="">Prefer not to provide</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option></select></Field></div>
              {error && <InlineNotice message={error} tone="error" />}
              <button disabled={saving} className="mt-2 rounded-xl bg-rose-600 py-3 font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Add student"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}{children}</label>; }
