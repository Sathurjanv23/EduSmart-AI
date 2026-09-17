import { UnavailableModule } from "@/components/UnavailableModule";
export default function Page() { return <UnavailableModule title="Exam oversight" description="A consolidated administrator exam review screen is not enabled." available={["Assigned teachers can create, publish, and review real exams from their portal.", "Students see published exams for their own class."]} />; }
