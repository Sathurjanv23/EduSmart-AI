"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { BellRing, Plus, Trash2, X } from "lucide-react";
import { addAnnouncement, deleteAnnouncement, getAllAnnouncements } from "@/app/services/announcementService";
import { Role } from "@/app/services/authService";
import { Announcement } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";
import { ErpLayout } from "@/components/ErpLayout";
import { ProtectedFileButton } from "@/components/ProtectedFileButton";
import { RoleGuard } from "@/components/RoleGuard";
import { useAuth } from "@/components/AuthProvider";

const ALL_ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;
const INITIAL_FORM = { title: "", content: "", visibleTo: ["STUDENT", "PARENT"] as Role[], priority: "NORMAL" as const, category: "" };

export default function AnnouncementsPage() {
  return <RoleGuard allowedRoles={ALL_ROLES}><ErpLayout><AnnouncementFeed /></ErpLayout></RoleGuard>;
}

function AnnouncementFeed() {
  const { role } = useAuth();
  const canManage = role === "ADMIN" || role === "TEACHER";
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setItems(await getAllAnnouncements()); }
    catch (unknownError: unknown) { setError(messageOf(unknownError, "Could not load announcements.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.visibleTo.length === 0) { setError("Select at least one audience role."); return; }
    setSaving(true);
    setError("");
    try {
      const created = await addAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
        visibleTo: form.visibleTo,
        priority: form.priority,
        category: form.category.trim() || undefined,
      });
      setItems((current) => [created, ...current]);
      setForm(INITIAL_FORM);
      setModalOpen(false);
      setNotice("Announcement published.");
    } catch (unknownError: unknown) {
      setError(messageOf(unknownError, "Could not publish the announcement."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Announcement) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setError("");
    try {
      await deleteAnnouncement(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setNotice("Announcement deleted.");
    } catch (unknownError: unknown) {
      setError(messageOf(unknownError, "Could not delete the announcement."));
    }
  };

  const toggleAudience = (audience: Role) => {
    setForm((current) => ({
      ...current,
      visibleTo: current.visibleTo.includes(audience)
        ? current.visibleTo.filter((item) => item !== audience)
        : [...current.visibleTo, audience],
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="flex items-center gap-3 text-3xl font-black"><BellRing className="h-8 w-8 text-blue-600" />Announcements</h1><p className="mt-1 text-slate-500">Notices visible to your authenticated role.</p></div>
        {canManage && <button type="button" onClick={() => { setError(""); setModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4" />New announcement</button>}
      </header>
      {notice && <InlineNotice message={notice} />}
      {error && !modalOpen && <InlineNotice message={error} tone="error" />}
      {loading ? <LoadingState label="Loading announcements…" /> : error && items.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : items.length === 0 ? <EmptyState title="No announcements" message="There are no notices for your role right now." /> : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-black">{item.title}</h2><div className="mt-2 flex flex-wrap gap-2">{item.priority && <Badge>{item.priority}</Badge>}{item.category && <Badge>{item.category}</Badge>}</div></div>
                {canManage && <button type="button" aria-label={`Delete ${item.title}`} title="Teachers can delete only announcements they created" onClick={() => void remove(item)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{item.content || item.message}</p>
              {item.attachmentUrl && <ProtectedFileButton fileUrl={item.attachmentUrl} />}
              {(item.publishedAt || item.createdAt) && <p className="mt-4 text-xs text-slate-400">{formatDate(item.publishedAt || item.createdAt || "")}</p>}
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="announcement-dialog-title">
          <form onSubmit={create} className="w-full max-w-xl space-y-4 rounded-3xl bg-white p-7 dark:bg-slate-900">
            <div className="flex items-center justify-between"><h2 id="announcement-dialog-title" className="text-xl font-black">Publish announcement</h2><button type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button></div>
            <Field label="Title"><input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="field" /></Field>
            <Field label="Message"><textarea required maxLength={10_000} rows={6} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="field" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Priority"><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as typeof form.priority })} className="field"><option>LOW</option><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></Field><Field label="Category (optional)"><input maxLength={80} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="field" /></Field></div>
            <fieldset><legend className="text-sm font-semibold">Visible to</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{ALL_ROLES.map((audience) => <label key={audience} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700"><input type="checkbox" checked={form.visibleTo.includes(audience)} onChange={() => toggleAudience(audience)} />{audience}</label>)}</div></fieldset>
            {error && <InlineNotice message={error} tone="error" />}
            <button disabled={saving} className="primary-button">{saving ? "Publishing…" : "Publish"}</button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1 text-sm font-semibold">{label}{children}</label>; }
function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{children}</span>; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
function messageOf(error: unknown, fallback: string) { return error instanceof Error ? error.message : fallback; }
