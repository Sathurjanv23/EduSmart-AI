import { ErpLayout } from "@/components/ErpLayout";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ErpLayout>{children}</ErpLayout>;
}
