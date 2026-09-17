import { UnavailableModule } from "@/components/UnavailableModule";
export default function Page() { return <UnavailableModule title="Security audit console" description="A persisted audit-log query interface is not enabled in this deployment." available={["JWT authentication, role guards, and backend authorization are active."]} />; }
