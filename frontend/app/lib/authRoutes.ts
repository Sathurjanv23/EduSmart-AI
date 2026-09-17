import { Role } from "@/app/services/authService";

export function dashboardForRole(role: Role): string {
  return `/${role.toLowerCase()}/dashboard`;
}

export function isSafeRoleReturnTo(role: Role, returnTo: string | null | undefined): returnTo is string {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) return false;
  try {
    const base = new URL("https://campuscore.invalid");
    const target = new URL(returnTo, base);
    if (target.origin !== base.origin) return false;
    if (target.pathname === "/announcements") return true;
    const roleRoot = `/${role.toLowerCase()}`;
    return target.pathname === roleRoot || target.pathname.startsWith(`${roleRoot}/`);
  } catch {
    return false;
  }
}
