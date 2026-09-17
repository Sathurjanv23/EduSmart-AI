import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./tokenStorage", () => ({
  readAuthToken: vi.fn(() => "signed-jwt"),
  clearAuthToken: vi.fn(),
}));

import { apiClient } from "./apiService";

describe("central API client", () => {
  beforeEach(() => vi.clearAllMocks());

  it("automatically attaches the one stored JWT", async () => {
    let captured: InternalAxiosRequestConfig | undefined;
    apiClient.defaults.adapter = async (config) => {
      captured = config;
      return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config };
    };
    await apiClient.get("/students/me");
    expect(captured?.headers.get("Authorization")).toBe("Bearer signed-jwt");
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
