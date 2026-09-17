"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { GraduationCap, LoaderCircle, LogOut, RefreshCw } from "lucide-react";
import { ApiClientError } from "@/app/services/apiService";
import { getCurrentStudent } from "@/app/services/studentService";
import { useAuth } from "./AuthProvider";

type ProfileState = "loading" | "ready" | "pending" | "error";

export function StudentProfileGuard({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const [state, setState] = useState<ProfileState>("loading");
  const [error, setError] = useState("");

  const verifyProfile = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      await getCurrentStudent();
      setState("ready");
    } catch (unknownError: unknown) {
      if (unknownError instanceof ApiClientError && unknownError.status === 404) {
        setState("pending");
      } else {
        setError(unknownError instanceof Error ? unknownError.message : "Could not verify your student profile.");
        setState("error");
      }
    }
  }, []);

  useEffect(() => { void verifyProfile(); }, [verifyProfile]);

  if (state === "ready") return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {state === "loading" ? (
          <div role="status" className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />Verifying your student profile…
          </div>
        ) : (
          <>
            <GraduationCap className="mx-auto h-10 w-10 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-black">{state === "pending" ? "Enrollment profile pending" : "Profile verification unavailable"}</h1>
            <p className="mt-3 text-sm text-slate-500">
              {state === "pending"
                ? "Your login is verified, but an administrator has not created your class-linked student profile yet. Contact the school office and try again after it is provisioned."
                : error}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => void verifyProfile()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">
                <RefreshCw className="h-4 w-4" />Check again
              </button>
              <button type="button" onClick={signOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold dark:border-slate-700">
                <LogOut className="h-4 w-4" />Sign out
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
