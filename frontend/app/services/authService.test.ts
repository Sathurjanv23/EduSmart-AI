import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("./apiService", () => ({ apiRequest }));

import { loginUser, resetPassword, signupUser } from "./authService";

describe("authentication request safety", () => {
  beforeEach(() => apiRequest.mockReset().mockResolvedValue({ message: "OK" }));

  it("rejects privileged roles before public signup reaches the API", async () => {
    await expect(signupUser({ name: "Test", email: "test@example.com", password: "password", role: "ADMIN" })).rejects.toThrow(/only available/i);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("preserves password bytes while normalizing email", async () => {
    await loginUser({ email: "  USER@Example.COM ", password: " edge spaces " });
    const body = JSON.parse(apiRequest.mock.calls[0][1].body as string);
    expect(body).toEqual({ email: "user@example.com", password: " edge spaces " });
  });

  it("preserves a new password during reset", async () => {
    await resetPassword({ token: " reset-token ", newPassword: " keep spaces " });
    const body = JSON.parse(apiRequest.mock.calls[0][1].body as string);
    expect(body).toEqual({ token: "reset-token", newPassword: " keep spaces " });
  });
});
