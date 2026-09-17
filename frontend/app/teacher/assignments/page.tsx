"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ClipboardList, ClipboardPlus, NotebookPen, X } from "lucide-react";
import { createAssignment, getAssignmentSubmissions, getAssignments, gradeSubmission } from "@/app/services/assignmentService";
import { getTeacherProfile } from "@/app/services/teacherService";
import { Assignment, AssignmentSubmission } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";
import { ProtectedFileButton } from "@/components/ProtectedFileButton";

const EMPTY = { title: "", description: "", classId: "", subject: "", dueDate: "", maxMarks: 100 };

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewing, setReviewing] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const [items, profile] = await Promise.all([getAssignments(), getTeacherProfile()]); setAssignments(items); setClasses(profile.assignedClassIds); setSubjects(profile.assignedSubjects); setForm((current) => ({ ...current, classId: current.classId || profile.assignedClassIds[0] || "", subject: current.subject || profile.assignedSubjects[0] || "" })); }
    catch (unknownError: unknown) { setError(messageOf(unknownError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    if (!form.dueDate || new Date(form.dueDate).getTime() <= Date.now()) { setError("The assignment due date must be in the future."); setSaving(false); return; }
    try { const created = await createAssignment({ ...form, dueDate: form.dueDate }); setAssignments((current) => [created, ...current]); setForm({ ...EMPTY, classId: classes[0] || "", subject: subjects[0] || "" }); setModalOpen(false); setNotice("Assignment published successfully."); }
    catch (unknownError: unknown) { setError(messageOf(unknownError, "Could not create the assignment.")); }
    finally { setSaving(false); }
  };

  const openReview = async (assignment: Assignment) => {
    setReviewing(assignment); setReviewLoading(true); setError("");
    try { setSubmissions(await getAssignmentSubmissions(assignment.id)); }
    catch (unknownError: unknown) { setError(messageOf(unknownError, "Could not load submissions.")); }
    finally { setReviewLoading(false); }
  };

  const saveGrade = async (submission: AssignmentSubmission, marksObtained: number, feedback: string) => {
    if (!reviewing || marksObtained < 0 || marksObtained > reviewing.maxMarks) { setError(`Marks must be between 0 and ${reviewing?.maxMarks ?? 0}.`); return; }
    setSaving(true); setError("");
    try { const graded = await gradeSubmission(submission.id, { marks: marksObtained, feedback }); setSubmissions((current) => current.map((item) => item.id === graded.id ? graded : item)); setNotice("Submission grade saved."); }
    catch (unknownError: unknown) { setError(messageOf(unknownError, "Could not save the grade.")); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-6xl space-y-7"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="flex items-center gap-3 text-3xl font-black"><NotebookPen className="h-8 w-8 text-blue-600" />Assignments</h1><p className="mt-1 text-slate-500">Create work for assigned classes and grade real submissions.</p></div><button type="button" onClick={() => setModalOpen(true)} disabled={!classes.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><ClipboardPlus className="h-5 w-5" />Create assignment</button></header>{notice && <InlineNotice message={notice} />}{error && !modalOpen && <InlineNotice message={error} tone="error" />}{loading ? <LoadingState label="Loading assignments…" /> : error && assignments.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : assignments.length === 0 ? <EmptyState title="No assignments" message={classes.length ? "Create the first assignment for an assigned class." : "An administrator must assign a class to your teacher profile first."} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{assignments.map((assignment) => <article key={assignment.id} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-blue-600">{assignment.subject} · {assignment.classId}</p><h2 className="mt-1 text-xl font-black">{assignment.title}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">{assignment.status}</span></div><p className="mt-3 text-sm text-slate-500">{assignment.description || "No description."}</p><p className="mt-5 text-xs text-slate-500">Due {formatDate(assignment.dueDate)} · {assignment.maxMarks} marks</p><button type="button" onClick={() => void openReview(assignment)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"><ClipboardList className="h-4 w-4" />Review submissions</button></article>)}</div>}
    {modalOpen && <Modal title="Create assignment" close={() => setModalOpen(false)}><form onSubmit={create} className="space-y-4"><Field label="Title"><input required minLength={3} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="field" /></Field><Field label="Description"><textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="field" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Assigned class"><select required value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="field">{classes.map((classId) => <option key={classId}>{classId}</option>)}</select></Field><Field label="Assigned subject"><select required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="field">{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Due date"><input required type="datetime-local" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="field" /></Field><Field label="Maximum marks"><input required type="number" min={1} max={1000} value={form.maxMarks} onChange={(event) => setForm({ ...form, maxMarks: Number(event.target.value) })} className="field" /></Field></div>{error && <InlineNotice message={error} tone="error" />}<button disabled={saving} className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-60">{saving ? "Creating…" : "Publish assignment"}</button></form></Modal>}
    {reviewing && <Modal title={`Submissions · ${reviewing.title}`} close={() => { setReviewing(null); setSubmissions([]); }}>{reviewLoading ? <LoadingState label="Loading submissions…" /> : submissions.length === 0 ? <EmptyState title="No submissions" message="No student has submitted this assignment yet." /> : <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">{submissions.map((submission) => <GradeForm key={submission.id} submission={submission} maxMarks={reviewing.maxMarks} saving={saving} onSave={saveGrade} />)}</div>}</Modal>}
  </div>;
}

function GradeForm({ submission, maxMarks, saving, onSave }: { submission: AssignmentSubmission; maxMarks: number; saving: boolean; onSave: (submission: AssignmentSubmission, marks: number, feedback: string) => Promise<void> }) { const [marks, setMarks] = useState(submission.marksObtained ?? 0); const [feedback, setFeedback] = useState(submission.feedback || ""); return <form onSubmit={(event) => { event.preventDefault(); void onSave(submission, marks, feedback); }} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex justify-between gap-3"><div><p className="font-mono text-xs text-slate-500">Student {submission.studentId}</p><p className="mt-1 text-sm">{submission.submissionText || "File submission"}</p>{submission.submissionFileUrl && <ProtectedFileButton fileUrl={submission.submissionFileUrl} />}</div><span className="text-xs font-bold">{submission.status}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-[9rem_1fr_auto]"><label className="text-xs font-semibold">Marks / {maxMarks}<input type="number" min={0} max={maxMarks} value={marks} onChange={(event) => setMarks(Number(event.target.value))} className="field mt-1" /></label><label className="text-xs font-semibold">Feedback<input required value={feedback} onChange={(event) => setFeedback(event.target.value)} className="field mt-1" /></label><button disabled={saving} className="self-end rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">Save grade</button></div></form>; }
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-3xl rounded-3xl bg-white p-7 dark:bg-slate-900"><div className="mb-5 flex justify-between"><h2 className="text-xl font-black">{title}</h2><button type="button" onClick={close} aria-label="Close"><X className="h-5 w-5" /></button></div>{children}</div></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1 text-sm font-semibold">{label}{children}</label>; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
function messageOf(error: unknown, fallback = "Could not load assignments.") { return error instanceof Error ? error.message : fallback; }
