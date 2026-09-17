"use client";

import { Role } from "@/app/services/authService";
import { AuthProvider, useAuth } from "./AuthProvider";

export type { Role };

/** @deprecated Use AuthProvider. Kept as a compatibility alias. */
export const RoleProvider = AuthProvider;

/** Authenticated role compatibility hook. The role is intentionally read-only. */
export function useRole(): { role: Role | null } {
  const { role } = useAuth();
  return { role };
}
