import { ErpLayout } from "@/components/ErpLayout";
import { RoleGuard } from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN"]}><ErpLayout>{children}</ErpLayout></RoleGuard>;
}
