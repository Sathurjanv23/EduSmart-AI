import Link from "next/link";
import { ArrowRight, BrainCircuit, Cpu, Zap } from "lucide-react";
import { InlineNotice } from "@/components/AsyncState";

const modules = [
  {
    title: "Performance predictor",
    description: "Run authorized, server-side risk inference from each student's recorded academic data.",
    status: "Backend connected",
    href: "/admin/ai/predictor",
    icon: Zap,
    available: true,
  },
  {
    title: "Question generator",
    description: "A server-side AI provider has not been configured, so generation remains disabled.",
    status: "Unavailable",
    href: "/admin/ai/generator",
    icon: BrainCircuit,
    available: false,
  },
];

export default function AIOverview() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-black"><Cpu className="h-8 w-8 text-rose-600" />CampusCore AI</h1>
        <p className="mt-1 text-slate-500">AI capabilities are labeled according to their actual server availability.</p>
      </header>
      <InlineNotice tone="info" message="No model accuracy, generated-paper count, or synthetic activity is shown without backend evidence." />
      <div className="grid gap-5 md:grid-cols-2">
        {modules.map(({ title, description, status, href, icon: Icon, available }) => (
          <Link key={href} href={href} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:border-rose-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <Icon className="h-7 w-7 text-rose-600" />
            <h2 className="mt-5 flex items-center gap-2 text-xl font-black">{title}<ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
            <p className={`mt-5 text-xs font-bold uppercase tracking-wider ${available ? "text-emerald-600" : "text-amber-600"}`}>{status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
