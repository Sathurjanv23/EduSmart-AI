import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div role="status" className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900"><LoaderCircle className="h-5 w-5 animate-spin" />{label}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/20"><AlertTriangle className="mb-3 h-7 w-7 text-rose-500" /><p className="text-sm font-semibold text-rose-800 dark:text-rose-200">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500">Try again</button>}</div>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"><Inbox className="mb-3 h-7 w-7 text-slate-400" /><h2 className="font-bold text-slate-800 dark:text-white">{title}</h2><p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p></div>;
}

export function InlineNotice({ message, tone = "success" }: { message: string; tone?: "success" | "error" | "info" }) {
  const styles = tone === "error" ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200" : tone === "info" ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200";
  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{message}</p>;
}
