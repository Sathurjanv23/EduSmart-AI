const API_BASE = "http://localhost:8080/api/auth";

// helper function
async function parseJsonSafely(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// LOGIN (Step 1 — returns {message:"OTP_SENT"} if password ok)
export async function loginUser(loginData: { email: string; password: string }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginData.email.toLowerCase().trim(),
      password: loginData.password.trim(),
    }),
  });
  const data = await parseJsonSafely(response);
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
}

// SIGNUP (creates PENDING account, triggers OTP to email)
export async function signupUser(signupData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: signupData.name.trim(),
      email: signupData.email.toLowerCase().trim(),
      password: signupData.password.trim(),
      role: signupData.role.toUpperCase().trim(),
    }),
  });
  const data = await parseJsonSafely(response);
  if (!response.ok) throw new Error(data.message || "Signup failed");
  return data;
}

// VERIFY OTP (REGISTER or LOGIN_2FA) → returns JWT on success
export async function verifyOtp(payload: {
  email: string;
  otp: string;
  purpose: "REGISTER" | "LOGIN_2FA";
}) {
  const response = await fetch(`${API_BASE}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafely(response);
  if (!response.ok) throw new Error(data.message || "OTP verification failed");
  return data;
}

// RESEND OTP
export async function resendOtp(payload: {
  email: string;
  purpose: "REGISTER" | "LOGIN_2FA";
}) {
  const response = await fetch(`${API_BASE}/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafely(response);
  if (!response.ok) throw new Error(data.message || "Resend failed");
  return data;
}

// FORGOT PASSWORD
export async function forgotPassword(email: string) {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.toLowerCase().trim() }),
  });
  const data = await parseJsonSafely(response);
  if (!response.ok) throw new Error(data.message || "Forgot password failed");
  return data;
}

// RESET PASSWORD
export async function resetPassword(resetData: {
  token: string;
  newPassword: string;
}) {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: resetData.token.trim(),
      newPassword: resetData.newPassword.trim(),
    }),
  });
  const data = await parseJsonSafely(response);
  return data;
}

// SESSION MANAGEMENT
export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth-token", token);
  }
}

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token");
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    localStorage.removeItem("demo-role");
    window.location.href = "/login";
  }
}