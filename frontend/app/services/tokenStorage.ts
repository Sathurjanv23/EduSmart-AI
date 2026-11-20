export const AUTH_TOKEN_KEY = "sms.auth.token";

/**
 * Legacy token reader: returns null as active session tokens are maintained
 * exclusively in secure HttpOnly cookies (`sms_session`) managed by the server.
 */
export function readAuthToken(): string | null {
  return null;
}

/**
 * No-op: Authentication tokens are delivered and managed via HttpOnly cookies by the server.
 */
export function writeAuthToken(token?: string): void {
  void token;
}

/**
 * Cleans up any legacy tokens stored in localStorage.
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}
