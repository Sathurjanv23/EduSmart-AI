import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { clearAuthToken } from "./tokenStorage";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

/**
 * In production NEXT_PUBLIC_API_URL must point to the Spring API, including
 * its `/api` prefix. `/api` is a safe same-origin fallback for local proxies.
 */
export const API_BASE_URL = (configuredBaseUrl || "/api").replace(/\/$/, "");

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

let csrfTokenPromise: Promise<string | null> | null = null;
let currentCsrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<string | null> {
  const existingCookie = readCookie("XSRF-TOKEN");
  if (existingCookie) {
    currentCsrfToken = existingCookie;
    return existingCookie;
  }
  if (currentCsrfToken) {
    return currentCsrfToken;
  }
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get<{ token?: string }>(`${API_BASE_URL}/auth/csrf`, {
        withCredentials: true,
      })
      .then((res) => {
        currentCsrfToken = res.data?.token || readCookie("XSRF-TOKEN");
        return currentCsrfToken;
      })
      .catch(() => null)
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase();
  const isStateChanging = method && ["post", "put", "patch", "delete"].includes(method);
  const requestUrl = config.url || "";
  const isPublicAuth =
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/signup") ||
    requestUrl.includes("/auth/verify-otp") ||
    requestUrl.includes("/auth/resend-otp") ||
    requestUrl.includes("/auth/forgot-password") ||
    requestUrl.includes("/auth/reset-password") ||
    requestUrl.includes("/auth/csrf");

  if (isStateChanging) {
    const headers = AxiosHeaders.from(config.headers);
    if (!headers.has("X-XSRF-TOKEN") && !headers.has("X-CSRF-TOKEN")) {
      const csrfToken = readCookie("XSRF-TOKEN") || currentCsrfToken || (!isPublicAuth ? await fetchCsrfToken() : null);
      if (csrfToken) {
        headers.set("X-XSRF-TOKEN", csrfToken);
        headers.set("X-CSRF-TOKEN", csrfToken);
      }
    }
    config.headers = headers;
  }
  return config;
});

function getErrorMessage(error: AxiosError<{ message?: string; error?: string }>): string {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message || error.response?.data?.error;
  if (serverMessage) return serverMessage;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status && status >= 500) return "The server could not complete the request.";
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (!error.response) return "Unable to reach the school server. Check your connection and try again.";
  return error.message || "The request failed.";
}

let isRedirectingToLogin = false;

export function resetRedirectForTesting() {
  isRedirectingToLogin = false;
}

apiClient.interceptors.response.use(
  (response) => response,
  (unknownError: unknown) => {
    if (!axios.isAxiosError(unknownError)) {
      return Promise.reject(unknownError);
    }

    const status = unknownError.response?.status;
    const requestUrl = unknownError.config?.url || "";
    const isAuthRequest = requestUrl.startsWith("/auth/") && !requestUrl.startsWith("/auth/logout");
    if (typeof window !== "undefined" && status === 401 && !isAuthRequest) {
      clearAuthToken();
      window.dispatchEvent(new Event("sms:session-expired"));
      const path = window.location.pathname;
      if (!isRedirectingToLogin && path !== "/login" && !path.startsWith("/reset-password")) {
        isRedirectingToLogin = true;
        const returnTo = `${path}${window.location.search}`;
        window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      }
    }

    if (status === 403) {
      currentCsrfToken = null;
    }

    const errorData = unknownError.response?.data as { code?: string } | undefined;
    return Promise.reject(
      new ApiClientError(
        getErrorMessage(unknownError),
        status,
        unknownError.response?.data,
        errorData?.code,
      ),
    );
  },
);

export interface ApiRequestOptions extends Omit<AxiosRequestConfig, "url" | "data"> {
  body?: BodyInit | object | null;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return error instanceof ApiClientError ? error.code : undefined;
}

/** Compatibility wrapper used by existing services while sharing one client. */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, ...config } = options;
  let data: unknown = body;

  if (typeof body === "string") {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }

  const response = await apiClient.request<T>({
    url: endpoint,
    ...config,
    data,
  });
  return response.data;
}
