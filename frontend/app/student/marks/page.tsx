"use client";

import { useCallback, useEffect, useState } from "react";
import { Award } from "lucide-react";
import { getMyMarks } from "@/app/services/marksService";
import { getCurrentStudent } from "@/app/services/studentService";
import { MarkRecord, Student } from "@/app/types/api";
import { ErrorState, LoadingState } from "@/components/AsyncState";
import AcademicResultsView from "@/components/academic/AcademicResultsView";

export default function StudentMarksPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileData, marksData] = await Promise.all([
        getCurrentStudent(),
        getMyMarks(),
      ]);
      setStudent(profileData);
      setMarks(marksData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load your academic results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingState label="Loading your published academic marks…" />;
  }

  if (error || !student) {
    return (
      <ErrorState
        message={error || "Student profile unavailable."}
        onRetry={() => void loadData()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-16">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white">
          <Award className="h-8 w-8 text-emerald-600" />
          My Academic Results
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Official finalized marks published by your course teachers and school administration.
        </p>
      </header>

      <AcademicResultsView
        studentName={student.name}
        studentClass={student.studentClass}
        studentEmail={student.email}
        marks={marks}
        roleTitle="Student Academic Performance"
      />
    </div>
  );
}
