import { ErpLayout } from "@/components/ErpLayout";
import { RoleGuard } from "@/components/RoleGuard";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["PARENT"]}><ErpLayout>{children}</ErpLayout></RoleGuard>;
}
