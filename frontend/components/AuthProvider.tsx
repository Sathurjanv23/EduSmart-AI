"use client";

import * as React from "react";
import {
  AUTH_ROLES,
  AuthResponse,
  AuthUser,
  getCurrentUser,
  logoutUser,
  Role,
} from "@/app/services/authService";
import { clearAuthToken } from "@/app/services/tokenStorage";
import { ApiClientError } from "@/app/services/apiService";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  status: AuthStatus;
  authError: string;
  establishSession: (response: AuthResponse) => Promise<AuthUser>;
  refreshSession: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function isRole(value: unknown): value is Role {
  return typeof value === "string" && AUTH_ROLES.includes(value.toUpperCase() as Role);
}

function normalizeUser(value: unknown): AuthUser {
  if (!value || typeof value !== "object") {
    throw new Error("The server returned an invalid user profile.");
  }
  const candidate = value as Partial<AuthUser> & { userId?: string };
  if (!isRole(candidate.role) || !candidate.email || !candidate.name) {
    throw new Error("The server returned an incomplete user profile.");
  }

  return {
    id: String(candidate.id || candidate.userId || ""),
    name: String(candidate.name),
    email: String(candidate.email),
    role: candidate.role.toUpperCase() as Role,
    status: candidate.status ? String(candidate.status) : undefined,
    emailVerified: typeof candidate.emailVerified === "boolean" ? candidate.emailVerified : undefined,
    profileId: candidate.profileId ? String(candidate.profileId) : undefined,
    studentId: candidate.studentId ? String(candidate.studentId) : undefined,
    teacherId: candidate.teacherId ? String(candidate.teacherId) : undefined,
    parentId: candidate.parentId ? String(candidate.parentId) : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [authError, setAuthError] = React.useState("");

  const refreshSession = React.useCallback(async () => {
    setStatus("loading");
    setAuthError("");
    try {
      const currentUser = normalizeUser(await getCurrentUser());
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (unknownError: unknown) {
      if (unknownError instanceof ApiClientError && (unknownError.status === 401 || unknownError.status === 403)) {
        clearAuthToken();
        setUser(null);
        setStatus("unauthenticated");
      } else {
        setAuthError(unknownError instanceof Error ? unknownError.message : "Could not verify your session.");
        setStatus("error");
      }
      return null;
    }
  }, []);

  React.useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  React.useEffect(() => {
    const expire = () => {
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener("sms:session-expired", expire);
    return () => window.removeEventListener("sms:session-expired", expire);
  }, []);

  const establishSession = React.useCallback(async (response: AuthResponse) => {
    try {
      // A safe login response avoids another round trip; reloads are verified via /me.
      const authenticatedUser = response.user
        ? normalizeUser(response.user)
        : normalizeUser(await getCurrentUser());
      setUser(authenticatedUser);
      setStatus("authenticated");
      setAuthError("");
      return authenticatedUser;
    } catch (error) {
      clearAuthToken();
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Continue cleanup
    } finally {
      clearAuthToken();
      setUser(null);
      setStatus("unauthenticated");
      setAuthError("");
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, role: user?.role ?? null, status, authError, establishSession, refreshSession, signOut }),
    [authError, establishSession, refreshSession, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
