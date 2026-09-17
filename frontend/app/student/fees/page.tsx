"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CreditCard, ReceiptText } from "lucide-react";
import { getMyFeeSummary, getMyFeeTransactions } from "@/app/services/financeService";
import { FeeSummary, FeeTransaction } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";

export default function StudentFeesPage() {
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [items, totals] = await Promise.all([getMyFeeTransactions(), getMyFeeSummary()]); setTransactions(items); setSummary(totals); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not load fee records."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const currency = summary?.currency || "LKR";

  return <div className="mx-auto max-w-6xl space-y-7"><header><h1 className="flex items-center gap-3 text-3xl font-black"><CreditCard className="h-8 w-8 text-emerald-600" />My fees</h1><p className="mt-1 text-slate-500">Server-recorded balances and transaction history.</p></header><InlineNotice tone="info" message="Online payment is not configured. This page does not simulate or claim successful payments; contact the school office to pay an outstanding balance." />{loading ? <LoadingState label="Loading fee records…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : <><div className="grid gap-4 sm:grid-cols-3"><SummaryCard icon={Banknote} label="Assigned" value={money(summary?.totalCharged || 0, currency)} /><SummaryCard icon={ReceiptText} label="Paid" value={money(summary?.totalPaid || 0, currency)} /><SummaryCard icon={CreditCard} label="Balance" value={money(summary?.outstandingBalance || 0, currency)} /></div>{transactions.length === 0 ? <EmptyState title="No fee transactions" message="There are no fee records associated with your profile." /> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60"><tr><th className="px-5 py-3">Transaction</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Paid</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{transactions.map((transaction) => <tr key={transaction.id}><td className="px-5 py-4 font-mono text-xs">{transaction.transactionId || transaction.id}</td><td className="px-5 py-4">{money(transaction.amount, currency)}</td><td className="px-5 py-4">{money(transaction.paidAmount, currency)}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold dark:bg-slate-800">{transaction.status}</span></td><td className="px-5 py-4 text-slate-500">{formatDate(transaction.paidDate || transaction.dueDate)}</td></tr>)}</tbody></table></div></section>}</>}</div>;
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></div>; }
function money(amount: number, currency: string) { try { return new Intl.NumberFormat("en-LK", { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount.toFixed(2)}`; } }
function formatDate(value?: string) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(); }
