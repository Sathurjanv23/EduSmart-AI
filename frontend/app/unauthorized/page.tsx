"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function UnauthorizedPage() {
  const { role, signOut } = useAuth();
  const dashboard = role ? `/${role.toLowerCase()}/dashboard` : "/login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <ShieldX className="mx-auto h-14 w-14 text-rose-500" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">Access denied</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Your account does not have permission to open that area. Role permissions are enforced by both the app and the server.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={dashboard} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500">
            Go to my dashboard
          </Link>
          <button onClick={signOut} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Sign in with another account
          </button>
        </div>
      </section>
    </main>
  );
}
