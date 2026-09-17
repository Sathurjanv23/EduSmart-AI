import { apiRequest } from "./apiService";
import { clearAuthToken, readAuthToken, writeAuthToken } from "./tokenStorage";

const API_BASE = "/auth";

export const AUTH_ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;
export type Role = (typeof AUTH_ROLES)[number];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  emailVerified?: boolean;
  profileId?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: AuthUser;
  email?: string;
}

// LOGIN (Step 1 — returns {message:"OTP_SENT"} if password ok)
export async function loginUser(loginData: { email: string; password: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`${API_BASE}/login`, {
    method: "POST",
    body: JSON.stringify({
      email: loginData.email.toLowerCase().trim(),
      password: loginData.password,
    }),
  });
}

// SIGNUP (creates PENDING account, triggers OTP to email)
export async function signupUser(signupData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  if (signupData.role !== "STUDENT" && signupData.role !== "PARENT") {
    throw new Error("Public registration is only available to students and parents.");
  }
  return apiRequest<AuthResponse>(`${API_BASE}/signup`, {
    method: "POST",
    body: JSON.stringify({
      name: signupData.name.trim(),
      email: signupData.email.toLowerCase().trim(),
      password: signupData.password,
      role: signupData.role.toUpperCase().trim(),
    }),
  });
}

// VERIFY OTP (REGISTER or LOGIN_2FA) → returns JWT on success
export async function verifyOtp(payload: {
  email: string;
  otp: string;
  purpose: "REGISTER" | "LOGIN_2FA";
}) {
  return apiRequest<AuthResponse>(`${API_BASE}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, email: payload.email.toLowerCase().trim(), otp: payload.otp.trim() }),
  });
}

// RESEND OTP
export async function resendOtp(payload: {
  email: string;
  purpose: "REGISTER" | "LOGIN_2FA";
}) {
  return apiRequest<AuthResponse>(`${API_BASE}/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, email: payload.email.toLowerCase().trim() }),
  });
}

// FORGOT PASSWORD
export async function forgotPassword(email: string) {
  return apiRequest<AuthResponse>(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.toLowerCase().trim() }),
  });
}

// RESET PASSWORD
export async function resetPassword(resetData: {
  token: string;
  newPassword: string;
}) {
  return apiRequest<AuthResponse>(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: resetData.token.trim(),
      newPassword: resetData.newPassword,
    }),
  });
}

// SESSION MANAGEMENT
export function saveToken(token: string) {
  if (!token) throw new Error("The server did not return a session token.");
  writeAuthToken(token);
}

export function getToken() {
  return readAuthToken();
}

export function logout() {
  clearAuthToken();
  if (typeof window !== "undefined") window.location.assign("/login");
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<AuthUser | { user: AuthUser }>(`${API_BASE}/me`);
  return "user" in response ? response.user : response;
}
