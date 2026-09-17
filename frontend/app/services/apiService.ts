import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { clearAuthToken, readAuthToken } from "./tokenStorage";

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
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readAuthToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
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

apiClient.interceptors.response.use(
  (response) => response,
  (unknownError: unknown) => {
    if (!axios.isAxiosError(unknownError)) {
      return Promise.reject(unknownError);
    }

    const status = unknownError.response?.status;
    const requestUrl = unknownError.config?.url || "";
    const isAuthRequest = requestUrl.startsWith("/auth/");
    const hasSession = Boolean(readAuthToken());
    if (typeof window !== "undefined" && status === 401 && hasSession && !isAuthRequest) {
      clearAuthToken();
      window.dispatchEvent(new Event("sms:session-expired"));
      const path = window.location.pathname;
      if (path !== "/login" && !path.startsWith("/reset-password")) {
        const returnTo = `${path}${window.location.search}`;
        window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      }
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
