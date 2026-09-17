import { ErpLayout } from "@/components/ErpLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { StudentProfileGuard } from "@/components/StudentProfileGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["STUDENT"]}><StudentProfileGuard><ErpLayout>{children}</ErpLayout></StudentProfileGuard></RoleGuard>;
}
