"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, BookOpenCheck, CalendarCheck, Users } from "lucide-react";
import { getAllAnnouncements } from "@/app/services/announcementService";
import { getAssignmentsByStudent } from "@/app/services/assignmentService";
import { getAttendanceByStudent } from "@/app/services/attendanceService";
import { getMarksByStudent } from "@/app/services/marksService";
import { getParentChildren } from "@/app/services/studentService";
import { Announcement, Assignment, AttendanceRecord, MarkRecord, Student } from "@/app/types/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import AcademicResultsView from "@/components/academic/AcademicResultsView";

type Tab = "attendance" | "marks" | "assignments" | "announcements";

export default function ParentPortalPage() {
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tab, setTab] = useState<Tab>("attendance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track request sequence to prevent stale/concurrent race conditions when toggling children
  const requestSeq = useRef(0);

  const loadChildren = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const linked = await getParentChildren();
      setChildren(linked);
      setSelectedId((current) => current || linked[0]?.id || "");
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not load linked children.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (!selectedId) return;

    // Immediately clear stale data from previously selected child
    setAttendance([]);
    setMarks([]);
    setAssignments([]);
    setError("");
    setLoading(true);

    const currentSeq = ++requestSeq.current;

    Promise.all([
      getAttendanceByStudent(selectedId),
      getMarksByStudent(selectedId),
      getAssignmentsByStudent(selectedId),
      getAllAnnouncements(),
    ])
      .then(([attendanceData, marksData, assignmentData, announcementData]) => {
        // Discard stale response if a newer child selection has been initiated
        if (currentSeq !== requestSeq.current) return;
        setAttendance(attendanceData);
        setMarks(marksData);
        setAssignments(assignmentData);
        setAnnouncements(announcementData);
      })
      .catch((unknownError: unknown) => {
        if (currentSeq !== requestSeq.current) return;
        setError(unknownError instanceof Error ? unknownError.message : "Could not load this child's academic data.");
      })
      .finally(() => {
        if (currentSeq === requestSeq.current) {
          setLoading(false);
        }
      });
  }, [selectedId]);

  const selectedChild = children.find((child) => child.id === selectedId);

  const attendancePercentage = useMemo(() => {
    const counted = attendance.filter((record) => record.status !== "PENDING");
    return counted.length
      ? Math.round(
          (counted.filter((record) => record.status === "PRESENT" || record.status === "LATE").length /
            counted.length) *
            100
        )
      : null;
  }, [attendance]);

  const marksAverage = useMemo(() => {
    const values = marks
      .map((mark) => {
        const score = mark.marksObtained ?? mark.marks;
        if (score === undefined || score === null) return null;
        return mark.totalMarks && mark.totalMarks > 0 ? (score / mark.totalMarks) * 100 : null;
      })
      .filter((value): value is number => value !== null);

    return values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : null;
  }, [marks]);

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-16">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white">
          <Users className="h-8 w-8 text-purple-600" />
          Child Progress &amp; Results
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Academic records and published results for students linked to your authenticated parent account.
        </p>
      </header>

      {loading && children.length === 0 ? (
        <LoadingState label="Loading linked children…" />
      ) : error && children.length === 0 ? (
        <ErrorState message={error} onRetry={() => void loadChildren()} />
      ) : children.length === 0 ? (
        <EmptyState
          title="No linked students"
          message="Ask an administrator to link your parent email to a student profile."
        />
      ) : (
        <>
          {/* Linked Child Selector */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="grid max-w-md gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              Select Linked Child
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} · Class {child.studentClass}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <ErrorState message={error} />}

          {selectedChild && (
            <>
              {/* Metric Highlights */}
              <div className="grid gap-4 sm:grid-cols-4">
                <Summary
                  icon={CalendarCheck}
                  label="Attendance Rate"
                  value={attendancePercentage === null ? "—" : `${attendancePercentage}%`}
                />
                <Summary
                  icon={BookOpenCheck}
                  label="Published Marks Average"
                  value={marksAverage === null ? "—" : `${marksAverage}%`}
                />
                <Summary
                  icon={BookOpenCheck}
                  label="Published Assignments"
                  value={assignments.length}
                />
                <Summary
                  icon={Bell}
                  label="School Announcements"
                  value={announcements.length}
                />
              </div>

              {/* Tab Navigation & Panel Content */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                  {(["attendance", "marks", "assignments", "announcements"] as Tab[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTab(item)}
                      className={`min-w-36 flex-1 px-5 py-4 text-sm font-bold capitalize transition-colors ${
                        tab === item
                          ? "border-b-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {item === "marks" ? "Academic Results" : item}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {loading && tab !== "marks" ? (
                    <LoadingState label={`Loading ${selectedChild.name}'s records…`} />
                  ) : tab === "attendance" ? (
                    <AttendanceTable records={attendance} />
                  ) : tab === "marks" ? (
                    loading ? (
                      <LoadingState label={`Loading ${selectedChild.name}'s published marks…`} />
                    ) : (
                      <AcademicResultsView
                        studentName={selectedChild.name}
                        studentClass={selectedChild.studentClass}
                        studentEmail={selectedChild.email}
                        marks={marks}
                        roleTitle="Child Academic Progress"
                      />
                    )
                  ) : tab === "assignments" ? (
                    <AssignmentList assignments={assignments} />
                  ) : (
                    <AnnouncementList announcements={announcements} />
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Icon className="h-5 w-5 text-purple-600" />
      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  if (!records.length) {
    return (
      <EmptyState
        title="No attendance recorded"
        message="No attendance sessions have been logged for this student yet."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <tr>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Class</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Remarks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map((record, index) => (
            <tr key={record.id || index}>
              <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                {record.attendanceDate || record.date}
              </td>
              <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{record.classId}</td>
              <td className="px-5 py-3.5 font-bold">
                <span
                  className={`inline-block rounded-lg px-2.5 py-0.5 text-xs ${
                    record.status === "PRESENT"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : record.status === "LATE"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}
                >
                  {record.status}
                </span>
              </td>
              <td className="px-5 py-3.5 text-xs text-slate-400">{record.remark || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentList({ assignments }: { assignments: Assignment[] }) {
  if (!assignments.length) {
    return (
      <EmptyState
        title="No published assignments"
        message="No assignments have been assigned to this student's class."
      />
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <article
          key={assignment.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                {assignment.subject}
              </span>
              <h3 className="mt-1 font-bold text-slate-900 dark:text-white">{assignment.title}</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Due {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{assignment.description}</p>
        </article>
      ))}
    </div>
  );
}

function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  if (!announcements.length) {
    return (
      <EmptyState
        title="No announcements"
        message="There are no announcements for this student's class or role."
      />
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <article
          key={announcement.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="font-bold text-slate-900 dark:text-white">{announcement.title}</h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {announcement.message || announcement.content}
          </p>
        </article>
      ))}
    </div>
  );
}
