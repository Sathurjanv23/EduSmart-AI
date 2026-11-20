import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./tokenStorage", () => ({
  readAuthToken: vi.fn(() => null),
  clearAuthToken: vi.fn(),
}));

import { apiClient } from "./apiService";

describe("central API client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (globalThis as { document?: unknown }).document;
  });

  it("enables credentials for secure HttpOnly cookie delivery", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it("automatically attaches CSRF token on state-changing requests", async () => {
    let captured: InternalAxiosRequestConfig | undefined;
    apiClient.defaults.adapter = async (config) => {
      captured = config;
      return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config };
    };
    (globalThis as { document?: unknown }).document = {
      cookie: "XSRF-TOKEN=test-csrf-token",
    };

    await apiClient.post("/attendance", { studentId: "s-1" });
    expect(captured?.headers.get("X-XSRF-TOKEN")).toBe("test-csrf-token");
  });

  it.each([401, 403])("surfaces status %s as a typed error", async (status) => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError("request failed", undefined, config, undefined, {
        data: { message: status === 401 ? "Session invalid" : "Forbidden" },
        status,
        statusText: "Error",
        headers: {},
        config,
      });
    };
    await expect(apiClient.get("/protected")).rejects.toMatchObject({ status });
  });
});
