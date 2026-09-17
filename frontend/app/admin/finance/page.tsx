import Link from "next/link";
import { ArrowRight, Banknote, CreditCard, Wallet } from "lucide-react";
import { InlineNotice } from "@/components/AsyncState";

const modules = [
  {
    title: "Fee administration",
    description: "Payment collection and reconciliation require a configured server-side workflow.",
    href: "/admin/finance/fees",
    icon: Banknote,
  },
  {
    title: "Staff salary",
    description: "Payroll processing is not enabled in this deployment.",
    href: "/admin/finance/salary",
    icon: CreditCard,
  },
];

export default function FinanceOverview() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-black"><Wallet className="h-8 w-8 text-rose-600" />Finance</h1>
        <p className="mt-1 text-slate-500">Only server-backed financial records are presented as real.</p>
      </header>
      <InlineNotice tone="info" message="CampusCore does not estimate collections, payouts, or payment success. Student fee balances remain available in the scoped student portal." />
      <div className="grid gap-5 md:grid-cols-2">
        {modules.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:border-rose-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <Icon className="h-7 w-7 text-rose-600" />
            <h2 className="mt-5 flex items-center gap-2 text-xl font-black">{title}<ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-amber-600">Not configured</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
