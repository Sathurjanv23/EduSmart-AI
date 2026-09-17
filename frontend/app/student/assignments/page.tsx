"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, FileUp, NotebookPen, X } from "lucide-react";
import { getAvailableAssignments, getMySubmissions, submitAssignment, uploadAssignmentFile } from "@/app/services/assignmentService";
import { Assignment, AssignmentSubmission } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";
import { ProtectedFileButton } from "@/components/ProtectedFileButton";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const [available, mine] = await Promise.all([getAvailableAssignments(), getMySubmissions()]); setAssignments(available); setSubmissions(mine); }
    catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load assignments."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const byAssignment = useMemo(() => new Map(submissions.map((submission) => [submission.assignmentId, submission])), [submissions]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    if (!text.trim() && !file) { setError("Add a written response or attach a file."); return; }
    if (file && file.size > 10 * 1024 * 1024) { setError("The attachment must be 10 MB or smaller."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const upload = file ? await uploadAssignmentFile(file) : undefined;
      const created = await submitAssignment({ assignmentId: selected.id, submissionText: text.trim() || undefined, submissionFileUrl: upload?.fileUrl });
      setSubmissions((current) => [created, ...current.filter((item) => item.assignmentId !== created.assignmentId)]);
      setSelected(null); setText(""); setFile(null); setNotice("Your assignment was submitted successfully.");
    } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not submit the assignment."); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-6xl space-y-7"><header><h1 className="flex items-center gap-3 text-3xl font-black"><NotebookPen className="h-8 w-8 text-emerald-600" />My assignments</h1><p className="mt-1 text-slate-500">Published work available to your authenticated student profile.</p></header>{notice && <InlineNotice message={notice} />}{error && !selected && <InlineNotice message={error} tone="error" />}{loading ? <LoadingState label="Loading assignments and submissions…" /> : error && assignments.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : assignments.length === 0 ? <EmptyState title="No assignments available" message="Published assignments for your class will appear here." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{assignments.map((assignment) => { const submission = byAssignment.get(assignment.id); const overdue = new Date(assignment.dueDate).getTime() < Date.now(); return <article key={assignment.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{assignment.subject}</p><h2 className="mt-1 text-xl font-black">{assignment.title}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">{submission?.status || (overdue ? "CLOSED" : "OPEN")}</span></div><p className="mt-3 flex-1 text-sm text-slate-500">{assignment.description || "No description provided."}</p><p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarClock className="h-4 w-4" />Due {formatDate(assignment.dueDate)} · {assignment.maxMarks} marks</p>{submission?.submissionText && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Your response: {submission.submissionText}</p>}{submission?.submissionFileUrl && <ProtectedFileButton fileUrl={submission.submissionFileUrl} />}{submission?.feedback && <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">Feedback: {submission.feedback}</p>}<button type="button" onClick={() => { setSelected(assignment); setError(""); setText(""); setFile(null); }} disabled={Boolean(submission) || overdue} className="mt-5 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{submission ? "Submission recorded" : overdue ? "Deadline passed" : "Submit work"}</button></article>; })}</div>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-xl rounded-3xl bg-white p-7 dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-emerald-600">{selected.subject}</p><h2 className="text-xl font-black">{selected.title}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close"><X className="h-5 w-5" /></button></div><label className="mt-6 grid gap-2 text-sm font-semibold">Written response<textarea rows={6} value={text} onChange={(event) => setText(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800" /></label><label className="mt-4 grid gap-2 text-sm font-semibold">Attachment (optional, max 10 MB)<span className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700"><FileUp className="h-5 w-5" /><input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} /></span></label>{error && <div className="mt-4"><InlineNotice message={error} tone="error" /></div>}<button disabled={saving} className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-bold text-white disabled:opacity-60">{saving ? "Uploading and submitting…" : "Submit assignment"}</button></form></div>}
  </div>;
}

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
