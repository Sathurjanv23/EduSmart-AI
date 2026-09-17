import { ErpLayout } from "@/components/ErpLayout";
import { RoleGuard } from "@/components/RoleGuard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["TEACHER"]}><ErpLayout>{children}</ErpLayout></RoleGuard>;
}
