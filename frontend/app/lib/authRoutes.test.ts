import { describe, expect, it } from "vitest";
import { dashboardForRole, isSafeRoleReturnTo } from "./authRoutes";

describe("role routing", () => {
  it("maps each verified role to its dashboard", () => {
    expect(dashboardForRole("ADMIN")).toBe("/admin/dashboard");
    expect(dashboardForRole("STUDENT")).toBe("/student/dashboard");
  });

  it("allows only relative paths within the verified role", () => {
    expect(isSafeRoleReturnTo("TEACHER", "/teacher/attendance?date=today")).toBe(true);
    expect(isSafeRoleReturnTo("PARENT", "/announcements")).toBe(true);
    expect(isSafeRoleReturnTo("TEACHER", "/admin/dashboard")).toBe(false);
    expect(isSafeRoleReturnTo("TEACHER", "//evil.example/path")).toBe(false);
    expect(isSafeRoleReturnTo("TEACHER", "https://evil.example")).toBe(false);
    expect(isSafeRoleReturnTo("STUDENT", "/student/../admin/dashboard")).toBe(false);
    expect(isSafeRoleReturnTo("PARENT", "/parent/%2e%2e/admin/dashboard")).toBe(false);
  });
});
