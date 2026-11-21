"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  FileText,
  Search,
  AlertCircle,
  Send,
  AlertTriangle,
  X,
  Lock,
  Check,
} from "lucide-react";
import {
  addMarks,
  getMarksByClassAndSubject,
  MarksInput,
  publishMarks,
  updateMarks,
} from "@/app/services/marksService";
import { getTeacherClassStudents, getTeacherProfile, TeacherProfile } from "@/app/services/teacherService";
import { getExamsByClass } from "@/app/services/examService";
import { AssessmentType, Exam, MarkRecord, PublishMarksInput, Student } from "@/app/types/api";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/AsyncState";

interface StudentRowState {
  marks: string; // string for input flexibility (differentiating empty string from "0")
  totalMarks: number;
  comments: string;
  existingId?: string;
  status: "DRAFT" | "PUBLISHED" | "UNSAVED";
  isDirty: boolean;
  rowError?: string;
}

const ASSESSMENT_TYPES: { label: string; value: AssessmentType }[] = [
  { label: "Class Test", value: "CLASS_TEST" },
  { label: "Mid-Term Exam", value: "MID_TERM" },
  { label: "Term Test", value: "TERM_TEST" },
  { label: "Final Exam", value: "FINAL" },
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Other", value: "OTHER" },
];

export default function TeacherMarksWorkspacePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("CLASS_TEST");
  const [term, setTerm] = useState("Term 1");
  const [defaultTotalMarks, setDefaultTotalMarks] = useState<number>(100);

  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [rowStates, setRowStates] = useState<Record<string, StudentRowState>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [confirmPartial, setConfirmPartial] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // 1. Initial Load: Teacher Profile (Authorized classes & subjects)
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeacherProfile();
      setProfile(data);
      if (data.assignedClassIds.length > 0) {
        setSelectedClass(data.assignedClassIds[0]);
      }
      if (data.assignedSubjects.length > 0) {
        setSelectedSubject(data.assignedSubjects[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load teacher profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // 2. Load Exams for the selected class (for the assessment selector)
  useEffect(() => {
    if (!selectedClass) {
      setExams([]);
      return;
    }
    let active = true;
    getExamsByClass(selectedClass)
      .then((records) => {
        if (!active) return;
        setExams(records);
      })
      .catch(() => {
        if (active) setExams([]);
      });
    return () => {
      active = false;
    };
  }, [selectedClass]);

  // Update defaultTotalMarks & assessment context when an exam is selected
  useEffect(() => {
    if (!selectedExamId) return;
    const matched = exams.find((e) => e.id === selectedExamId);
    if (matched) {
      if (matched.totalMarks) {
        setDefaultTotalMarks(matched.totalMarks);
      }
      if (matched.subject && (!selectedSubject || selectedSubject !== matched.subject)) {
        setSelectedSubject(matched.subject);
      }
    }
  }, [selectedExamId, exams, selectedSubject]);

  // 3. Load Students & Existing Marks when context changes
  const loadStudentsAndMarks = useCallback(async () => {
    if (!selectedClass || !selectedSubject) {
      setStudents([]);
      setRowStates({});
      return;
    }

    setLoadingRoster(true);
    setError("");
    setNotice("");

    try {
      const [roster, existingMarks] = await Promise.all([
        getTeacherClassStudents(selectedClass),
        getMarksByClassAndSubject(
          selectedClass,
          selectedSubject,
          selectedExamId || undefined,
          !selectedExamId ? assessmentType : undefined,
          !selectedExamId ? term : undefined
        ),
      ]);

      const sortedRoster = [...roster].sort((a, b) => a.name.localeCompare(b.name));
      setStudents(sortedRoster);

      // Map existing marks by studentId
      const marksByStudentId = new Map<string, MarkRecord>();
      existingMarks.forEach((m) => {
        if (m.studentId) {
          marksByStudentId.set(m.studentId, m);
        }
      });

      const initialRows: Record<string, StudentRowState> = {};
      sortedRoster.forEach((student) => {
        const existing = marksByStudentId.get(student.id);
        if (existing) {
          const score = existing.marksObtained ?? existing.marks;
          initialRows[student.id] = {
            marks: score !== undefined ? String(score) : "",
            totalMarks: existing.totalMarks || defaultTotalMarks,
            comments: existing.comments || "",
            existingId: existing.id,
            status: existing.status || "DRAFT",
            isDirty: false,
          };
        } else {
          initialRows[student.id] = {
            marks: "",
            totalMarks: defaultTotalMarks,
            comments: "",
            status: "UNSAVED",
            isDirty: false,
          };
        }
      });
      setRowStates(initialRows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load students or marks.");
    } finally {
      setLoadingRoster(false);
    }
  }, [selectedClass, selectedSubject, selectedExamId, assessmentType, term, defaultTotalMarks]);

  useEffect(() => {
    void loadStudentsAndMarks();
  }, [loadStudentsAndMarks]);

  // Check for unsaved changes before switching contexts
  const hasUnsavedChanges = useMemo(() => {
    return Object.values(rowStates).some((row) => row.isDirty);
  }, [rowStates]);

  const handleClassChange = (newClass: string) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved marks. Discard them and switch class?")) {
        return;
      }
    }
    setSelectedClass(newClass);
    setSelectedExamId("");
  };

  const handleSubjectChange = (newSubject: string) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved marks. Discard them and switch subject?")) {
        return;
      }
    }
    setSelectedSubject(newSubject);
  };

  const handleExamChange = (newExamId: string) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved marks. Discard them and switch assessment?")) {
        return;
      }
    }
    setSelectedExamId(newExamId);
  };

  const handleCategoryChange = (newCategory: AssessmentType) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved marks. Discard them and switch category?")) {
        return;
      }
    }
    setAssessmentType(newCategory);
  };

  const handleTermChange = (newTerm: string) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved marks. Discard them and switch term?")) {
        return;
      }
    }
    setTerm(newTerm);
  };

  // Row update handlers
  const handleScoreChange = (studentId: string, val: string, total: number) => {
    setRowStates((prev) => {
      const current = prev[studentId] || {
        marks: "",
        totalMarks: total,
        comments: "",
        status: "UNSAVED",
        isDirty: false,
      };

      let rowErr: string | undefined = undefined;
      if (val.trim() !== "") {
        const num = Number(val);
        if (!Number.isInteger(num)) {
          rowErr = "Must be an integer";
        } else if (num < 0) {
          rowErr = "Cannot be negative";
        } else if (num > total) {
          rowErr = `Max is ${total}`;
        }
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          marks: val,
          isDirty: true,
          rowError: rowErr,
        },
      };
    });
  };

  const handleCommentsChange = (studentId: string, comments: string) => {
    setRowStates((prev) => {
      const current = prev[studentId];
      if (!current) return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          comments,
          isDirty: true,
        },
      };
    });
  };

  // Safe Bulk Save Draft
  const saveDrafts = async () => {
    setError("");
    setNotice("");

    // Identify rows that are dirty and valid
    const studentsToSave = students.filter((s) => {
      const row = rowStates[s.id];
      return row && row.isDirty && row.marks.trim() !== "" && !row.rowError;
    });

    if (studentsToSave.length === 0) {
      setError("No valid unsaved marks to save.");
      return;
    }

    setSaving(true);
    let successCount = 0;
    const failures: string[] = [];

    for (const student of studentsToSave) {
      const row = rowStates[student.id];
      const marksVal = parseInt(row.marks.trim(), 10);
      const payload: MarksInput = {
        studentId: student.id,
        subject: selectedSubject,
        marks: marksVal,
        totalMarks: row.totalMarks || defaultTotalMarks,
        examId: selectedExamId ? selectedExamId : undefined,
        assessmentType: !selectedExamId ? assessmentType : undefined,
        term: !selectedExamId ? term : undefined,
        comments: row.comments || undefined,
      };

      try {
        let saved: MarkRecord;
        if (row.existingId) {
          saved = await updateMarks(row.existingId, payload);
        } else {
          saved = await addMarks(payload);
        }
        successCount++;
        setRowStates((prev) => ({
          ...prev,
          [student.id]: {
            ...prev[student.id],
            existingId: saved.id,
            status: saved.status || "DRAFT",
            isDirty: false,
            rowError: undefined,
          },
        }));
      } catch (err: unknown) {
        failures.push(`${student.name}: ${err instanceof Error ? err.message : "Failed to save"}`);
      }
    }

    setSaving(false);
    if (successCount > 0 && failures.length === 0) {
      setNotice(`Successfully saved drafts for ${successCount} student${successCount > 1 ? "s" : ""}.`);
    } else if (successCount > 0 && failures.length > 0) {
      setNotice(`Saved ${successCount} student(s). Failed for ${failures.length} student(s).`);
      setError(failures.join("; "));
    } else if (failures.length > 0) {
      setError(`Failed to save marks: ${failures.join("; ")}`);
    }
  };

  // Safe Publication Action
  const handlePublish = async () => {
    if (hasUnsavedChanges) {
      setError("Please save your draft changes before publishing.");
      return;
    }

    setPublishing(true);
    setError("");
    setNotice("");

    const eligibleDraftIds = students
      .map((s) => rowStates[s.id])
      .filter((row): row is StudentRowState => Boolean(row && row.existingId && row.status === "DRAFT"))
      .map((row) => row.existingId as string);

    const payload: PublishMarksInput = {
      classId: selectedClass,
      subject: selectedSubject,
      examId: selectedExamId ? selectedExamId : undefined,
      assessmentType: !selectedExamId ? assessmentType : undefined,
      term: !selectedExamId ? term : undefined,
      markIds: eligibleDraftIds.length > 0 ? eligibleDraftIds : undefined,
      allowPartial: confirmPartial || stats.missingCount === 0,
    };

    try {
      const response = await publishMarks(payload);
      setShowPublishModal(false);
      setConfirmPartial(false);
      setNotice(response.message || `Successfully published ${response.publishedCount} marks.`);
      await loadStudentsAndMarks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish marks.");
      // Refresh server state so teacher inspects current authoritative state before retry
      await loadStudentsAndMarks();
    } finally {
      setPublishing(false);
    }
  };

  // Filter roster by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);

  // Statistics & Publication Readiness
  const stats = useMemo(() => {
    const total = students.length;
    let filled = 0;
    let sum = 0;
    let countWithMarks = 0;
    let publishedCount = 0;
    let draftCount = 0;
    let unsavedCount = 0;

    students.forEach((s) => {
      const row = rowStates[s.id];
      if (row) {
        if (row.isDirty) {
          unsavedCount++;
        }
        if (row.status === "PUBLISHED") {
          publishedCount++;
        } else if (row.status === "DRAFT" && !row.isDirty) {
          draftCount++;
        }
        if (row.marks.trim() !== "" && !row.rowError) {
          filled++;
          const score = parseInt(row.marks, 10);
          if (!isNaN(score) && row.totalMarks > 0) {
            sum += (score / row.totalMarks) * 100;
            countWithMarks++;
          }
        }
      }
    });

    const average = countWithMarks > 0 ? Math.round(sum / countWithMarks) : null;
    const missingCount = Math.max(0, total - (publishedCount + draftCount));
    const isAllPublished = total > 0 && publishedCount === total;

    return { total, filled, average, publishedCount, draftCount, unsavedCount, missingCount, isAllPublished };
  }, [students, rowStates]);

  const activeAssessmentTitle = useMemo(() => {
    if (selectedExamId) {
      const ex = exams.find((e) => e.id === selectedExamId);
      return ex ? `${ex.title} (${ex.totalMarks} Marks)` : "Selected Exam";
    }
    const cat = ASSESSMENT_TYPES.find((t) => t.value === assessmentType)?.label || assessmentType;
    return `${cat} · ${term}`;
  }, [selectedExamId, exams, assessmentType, term]);

  if (loading) {
    return <LoadingState label="Loading teacher marks workspace…" />;
  }

  if (error && !profile) {
    return <ErrorState message={error} onRetry={() => void loadProfile()} />;
  }

  if (!profile || profile.assignedClassIds.length === 0 || profile.assignedSubjects.length === 0) {
    return (
      <EmptyState
        title="No assigned classes or subjects"
        message="Your teacher profile does not have any assigned classes or subjects. Contact an administrator to assign them."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white">
            <Award className="h-8 w-8 text-blue-600" />
            Teacher Marks Entry Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record, evaluate, and save academic marks drafts for students in your authorized classes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes present
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setConfirmPartial(false);
              setShowPublishModal(true);
            }}
            disabled={publishing || saving || loadingRoster || hasUnsavedChanges || stats.draftCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
            title={
              hasUnsavedChanges
                ? "Save all draft changes first before publishing."
                : stats.draftCount === 0
                ? "No draft records available to publish."
                : "Publish marks to students and parents"
            }
          >
            <Send className="h-4 w-4" />
            Publish Results
          </button>
        </div>
      </header>

      {/* Global Notices */}
      {notice && <InlineNotice message={notice} tone="success" />}
      {error && <InlineNotice message={error} tone="error" />}

      {/* Missing Marks Alert Banner */}
      {!loadingRoster && stats.missingCount > 0 && stats.draftCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <span>
            <strong>Missing Marks Notice:</strong> {stats.missingCount} of {stats.total} enrolled student
            {stats.missingCount > 1 ? "s" : ""} have no saved marks for this assessment. Complete all drafts
            or confirm partial publication to proceed.
          </span>
        </div>
      )}

      {/* Context Selection Toolbar */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        {/* Class Selector */}
        <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          Assigned Class
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {profile.assignedClassIds.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* Subject Selector */}
        <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          Assigned Subject
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {profile.assignedSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* Assessment / Exam Selector */}
        <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          Assessment / Exam Link
          <select
            value={selectedExamId}
            onChange={(e) => handleExamChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">General Class Assessment</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.subject} · {exam.totalMarks} pts)
              </option>
            ))}
          </select>
        </label>

        {/* Context-specific attributes (Assessment Type or Max Marks) */}
        {!selectedExamId ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              Category
              <select
                value={assessmentType}
                onChange={(e) => handleCategoryChange(e.target.value as AssessmentType)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              Term
              <select
                value={term}
                onChange={(e) => handleTermChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </label>
          </div>
        ) : (
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400">Exam Total Points</span>
            <span className="mt-1 text-lg font-black text-blue-600">{defaultTotalMarks} Marks</span>
          </div>
        )}
      </section>

      {/* Summary Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-400">Students in Class</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-400">Scores Entered</p>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {stats.filled} <span className="text-xs font-normal text-slate-400">/ {stats.total}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-400">Drafts Saved</p>
          <p className="mt-2 text-2xl font-black text-indigo-600">{stats.draftCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-400">Published Results</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-400">Class Average</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.average !== null ? `${stats.average}%` : "—"}
          </p>
        </div>
      </div>

      {/* Student Marks Worksheet Table */}
      {loadingRoster ? (
        <LoadingState label={`Loading roster for ${selectedClass}…`} />
      ) : students.length === 0 ? (
        <EmptyState
          title={`No students enrolled in ${selectedClass}`}
          message="An administrator must assign student profiles to this class before marks can be recorded."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Table Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students in class…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void saveDrafts()}
                disabled={saving || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving ? "Saving Drafts…" : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmPartial(false);
                  setShowPublishModal(true);
                }}
                disabled={publishing || saving || loadingRoster || hasUnsavedChanges || stats.draftCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Publish Results
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Evaluation / Feedback</th>
                  <th className="px-6 py-4">Record Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => {
                  const row = rowStates[student.id] || {
                    marks: "",
                    totalMarks: defaultTotalMarks,
                    comments: "",
                    status: "UNSAVED",
                    isDirty: false,
                  };
                  const isPublished = row.status === "PUBLISHED";

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                        row.isDirty ? "bg-amber-50/30 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      {/* Student info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isPublished && <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Marks input */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <input
                            type="number"
                            min={0}
                            max={row.totalMarks}
                            disabled={isPublished}
                            placeholder="Score"
                            value={row.marks}
                            onChange={(e) =>
                              handleScoreChange(student.id, e.target.value, row.totalMarks)
                            }
                            className={`w-24 rounded-xl border px-3 py-2 text-center text-sm font-bold focus:outline-none ${
                              row.rowError
                                ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
                                : isPublished
                                ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                : "border-slate-200 bg-white text-slate-900 focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            }`}
                          />
                          {row.rowError && (
                            <span className="mt-1 text-[11px] font-semibold text-rose-600">
                              {row.rowError}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total marks display */}
                      <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                        / {row.totalMarks}
                      </td>

                      {/* Optional comments */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          disabled={isPublished}
                          placeholder="Teacher remarks (optional)"
                          value={row.comments}
                          onChange={(e) => handleCommentsChange(student.id, e.target.value)}
                          className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Published
                          </span>
                        ) : row.isDirty ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Unsaved Draft
                          </span>
                        ) : row.status === "DRAFT" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <FileText className="h-3.5 w-3.5" />
                            Draft Saved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            No Score
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">
              Showing {filteredStudents.length} of {students.length} enrolled students
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void saveDrafts()}
                disabled={saving || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving ? "Saving Drafts…" : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmPartial(false);
                  setShowPublishModal(true);
                }}
                disabled={publishing || saving || loadingRoster || hasUnsavedChanges || stats.draftCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Publish Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Publication */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Publish Academic Marks
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Confirm publication to release results to authorized students and parents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Context Summary */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Class:</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Subject:</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedSubject}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Assessment:</span>
                <span className="font-black text-blue-600">{activeAssessmentTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Enrolled Students:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{stats.total}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="font-bold text-slate-500">Drafts to Publish:</span>
                <span className="font-black text-emerald-600">{stats.draftCount}</span>
              </div>
              {stats.publishedCount > 0 && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Already Published:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{stats.publishedCount}</span>
                </div>
              )}
              {stats.missingCount > 0 && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Missing Marks:</span>
                  <span className="font-bold text-rose-600">{stats.missingCount}</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="rounded-2xl bg-blue-50/80 p-3.5 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 space-y-1">
              <p className="font-bold">🔒 Publication & Immutability Guarantee:</p>
              <p>
                Published marks become immediately accessible to students and linked parents in their portals.
                Once published, entries are locked against further direct teacher edits.
              </p>
            </div>

            {/* Incomplete Roster Warning & Confirmation Checkbox */}
            {stats.missingCount > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200">
                    <p className="font-bold">Incomplete Roster Detected</p>
                    <p className="mt-0.5">
                      {stats.missingCount} student(s) do not have saved marks. To publish only the available {stats.draftCount} marks, you must confirm partial publication.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmPartial}
                    onChange={(e) => setConfirmPartial(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500"
                  />
                  I confirm partial publication for {stats.draftCount} students.
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                disabled={publishing}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={publishing || (stats.missingCount > 0 && !confirmPartial)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {publishing ? (
                  "Publishing…"
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm &amp; Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
