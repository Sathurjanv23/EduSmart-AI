"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { Role } from "@/app/services/authService";
import { useAuth } from "./AuthProvider";

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: readonly Role[];
  children: React.ReactNode;
}) {
  const { role, status, authError, refreshSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    } else if (status === "authenticated" && (!role || !allowedRoles.includes(role))) {
      router.replace(`/unauthorized?from=${encodeURIComponent(pathname || "/")}`);
    }
  }, [allowedRoles, pathname, role, router, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300" role="status">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Verifying your session…
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div role="alert" className="max-w-md rounded-2xl border border-amber-200 bg-white p-7 text-center shadow-lg dark:border-amber-900 dark:bg-slate-900">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-500" />
          <h1 className="mt-3 text-lg font-bold">Session verification unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{authError}</p>
          <button type="button" onClick={() => void refreshSession()} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Try again</button>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !role || !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" role="status">
        <ShieldAlert className="h-6 w-6 text-slate-400" />
      </div>
    );
  }

  return <>{children}</>;
}
