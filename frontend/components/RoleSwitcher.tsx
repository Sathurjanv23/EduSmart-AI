"use client";

import { GraduationCap, Presentation, Users, Shield } from "lucide-react";
import { Role } from "@/app/services/authService";
import { useAuth } from "./AuthProvider";

const ROLES: Record<Role, { label: string; icon: typeof GraduationCap; color: string }> = {
  STUDENT: { label: "Student", icon: GraduationCap, color: "bg-emerald-500" },
  TEACHER: { label: "Teacher", icon: Presentation, color: "bg-blue-500" },
  PARENT: { label: "Parent", icon: Users, color: "bg-purple-500" },
  ADMIN: { label: "Admin", icon: Shield, color: "bg-rose-500" },
};

/** Displays the verified role. It never mutates roles or permissions. */
export function RoleSwitcher() {
  const { role } = useAuth();
  if (!role) return null;
  const activeRole = ROLES[role];

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${activeRole.color}`}>
        <activeRole.icon className="h-3.5 w-3.5 text-white" />
      </span>
      Authenticated as {activeRole.label}
    </div>
  );
}
