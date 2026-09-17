"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BarChart3, BookOpenCheck } from "lucide-react";
import { getMyMarks } from "@/app/services/marksService";
import { MarkRecord } from "@/app/types/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setMarks(await getMyMarks()); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load your marks."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  const average = useMemo(() => {
    const percentages = marks.map((mark) => percentage(mark)).filter((value): value is number => value !== null);
    return percentages.length ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length) : null;
  }, [marks]);

  return <div className="mx-auto max-w-5xl space-y-7"><header><h1 className="flex items-center gap-3 text-3xl font-black"><Award className="h-8 w-8 text-emerald-600" />My marks</h1><p className="mt-1 text-slate-500">Results associated with your authenticated student profile.</p></header>{loading ? <LoadingState label="Loading your marks…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : marks.length === 0 ? <EmptyState title="No marks published" message="Teacher-recorded results will appear here when they are available." /> : <><div className="grid gap-4 sm:grid-cols-2"><Summary icon={BarChart3} label="Average" value={average === null ? "—" : `${average}%`} /><Summary icon={BookOpenCheck} label="Assessments" value={marks.length} /></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60"><tr><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Percentage</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{marks.map((mark) => { const score = mark.marksObtained ?? mark.marks; const percent = percentage(mark); return <tr key={mark.id}><td className="px-5 py-4 font-semibold">{mark.subject}</td><td className="px-5 py-4">{score ?? "—"}</td><td className="px-5 py-4">{mark.totalMarks ?? "—"}</td><td className="px-5 py-4 font-bold">{percent === null ? "—" : `${percent.toFixed(1)}%`}</td></tr>; })}</tbody></table></div></div></>}</div>;
}

function percentage(mark: MarkRecord): number | null { const score = mark.marksObtained ?? mark.marks; if (score === undefined) return null; if (!mark.totalMarks) return score; return (score / mark.totalMarks) * 100; }
function Summary({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string | number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-3xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></div>; }
