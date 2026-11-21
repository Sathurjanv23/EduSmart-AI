"use client";

import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  Printer,
  Search,
  TrendingUp,
} from "lucide-react";
import { MarkRecord } from "@/app/types/api";
import { EmptyState } from "@/components/AsyncState";
import {
  calculatePercentage,
  exportResultsToCsv,
  formatScoreDate,
} from "@/app/services/academicResultsUtils";

export interface AcademicResultsViewProps {
  studentName: string;
  studentClass?: string;
  studentEmail?: string;
  marks: MarkRecord[];
  roleTitle?: string;
}

export default function AcademicResultsView({
  studentName,
  studentClass,
  studentEmail,
  marks,
  roleTitle = "Academic Results",
}: AcademicResultsViewProps) {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedTerm, setSelectedTerm] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST" | "SCORE_HIGH" | "SCORE_LOW">("NEWEST");
  const [searchQuery, setSearchQuery] = useState("");

  // Unique subjects and terms for filter dropdowns
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    marks.forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    return Array.from(set).sort();
  }, [marks]);

  const availableTerms = useMemo(() => {
    const set = new Set<string>();
    marks.forEach((m) => {
      if (m.term) set.add(m.term);
    });
    return Array.from(set).sort();
  }, [marks]);

  // Overall Statistics Calculations
  const stats = useMemo(() => {
    const total = marks.length;
    if (total === 0) {
      return {
        overallAverage: null,
        totalAssessments: 0,
        distinctSubjectsCount: 0,
        bestSubject: null as { subject: string; average: number } | null,
      };
    }

    const percentages = marks
      .map(calculatePercentage)
      .filter((p): p is number => p !== null);

    const overallAverage =
      percentages.length > 0
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : null;

    // Subject breakdown
    const subjectScores = new Map<string, number[]>();
    marks.forEach((m) => {
      const p = calculatePercentage(m);
      if (p !== null && m.subject) {
        if (!subjectScores.has(m.subject)) subjectScores.set(m.subject, []);
        subjectScores.get(m.subject)!.push(p);
      }
    });

    let bestSubject: { subject: string; average: number } | null = null;
    subjectScores.forEach((scores, sub) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (!bestSubject || avg > bestSubject.average) {
        bestSubject = { subject: sub, average: Math.round(avg) };
      }
    });

    return {
      overallAverage,
      totalAssessments: total,
      distinctSubjectsCount: availableSubjects.length,
      bestSubject,
    };
  }, [marks, availableSubjects]);

  // Subject Performance Averages for the visual progress chart
  const subjectAverages = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    marks.forEach((m) => {
      const p = calculatePercentage(m);
      if (p !== null && m.subject) {
        const cur = map.get(m.subject) || { sum: 0, count: 0 };
        map.set(m.subject, { sum: cur.sum + p, count: cur.count + 1 });
      }
    });

    return Array.from(map.entries())
      .map(([subject, data]) => ({
        subject,
        average: Math.round(data.sum / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [marks]);

  // Filtered and Sorted Marks List
  const filteredMarks = useMemo(() => {
    let result = [...marks];

    if (selectedSubject !== "ALL") {
      result = result.filter((m) => m.subject.toLowerCase() === selectedSubject.toLowerCase());
    }

    if (selectedTerm !== "ALL") {
      result = result.filter((m) => m.term?.toLowerCase() === selectedTerm.toLowerCase());
    }

    if (selectedType !== "ALL") {
      result = result.filter((m) => m.assessmentType?.toUpperCase() === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          (m.assessmentType && m.assessmentType.toLowerCase().includes(q)) ||
          (m.term && m.term.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortOrder === "SCORE_HIGH") {
        const pA = calculatePercentage(a) ?? -1;
        const pB = calculatePercentage(b) ?? -1;
        return pB - pA;
      }
      if (sortOrder === "SCORE_LOW") {
        const pA = calculatePercentage(a) ?? 999;
        const pB = calculatePercentage(b) ?? 999;
        return pA - pB;
      }
      if (sortOrder === "OLDEST") {
        const tA = new Date(a.publishedAt || a.recordedAt || 0).getTime();
        const tB = new Date(b.publishedAt || b.recordedAt || 0).getTime();
        return tA - tB;
      }
      // NEWEST
      const tA = new Date(a.publishedAt || a.recordedAt || 0).getTime();
      const tB = new Date(b.publishedAt || b.recordedAt || 0).getTime();
      return tB - tA;
    });

    return result;
  }, [marks, selectedSubject, selectedTerm, selectedType, searchQuery, sortOrder]);

  return (
    <div className="space-y-7">
      {/* Header Context Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Verified Published Records
            </span>
            {studentClass && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Class {studentClass}
              </span>
            )}
            {roleTitle && (
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                · {roleTitle}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {studentName}
          </h2>
          {studentEmail && (
            <p className="text-xs text-slate-400">{studentEmail}</p>
          )}
        </div>

        {/* Action Buttons: Export CSV & Print */}
        {marks.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => exportResultsToCsv(studentName, studentClass, filteredMarks.length > 0 ? filteredMarks : marks)}
              aria-label="Download results as CSV spreadsheet"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              Download CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print results report"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        )}
      </div>

      {marks.length === 0 ? (
        <EmptyState
          title="No marks published"
          message="Teacher-evaluated academic results will appear here as soon as they are finalized and published."
        />
      ) : (
        <>
          {/* Summary Metric KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Overall Average</span>
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                {stats.overallAverage !== null ? `${stats.overallAverage}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Normalized across published results</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Published Assessments</span>
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalAssessments}
              </p>
              <p className="mt-1 text-xs text-slate-500">Graded evaluation events</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Highest Performance</span>
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="mt-3 text-xl font-black text-slate-900 dark:text-white truncate">
                {stats.bestSubject ? stats.bestSubject.subject : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.bestSubject ? `${stats.bestSubject.average}% subject average` : "No scores recorded"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Subjects Evaluated</span>
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                {stats.distinctSubjectsCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">Academic subject areas</p>
            </div>
          </div>

          {/* Subject Performance Visualization (Progress Bars) */}
          {subjectAverages.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Subject Performance Overview
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {subjectAverages.map((item) => {
                  const barColor =
                    item.average >= 75
                      ? "bg-emerald-500"
                      : item.average >= 60
                      ? "bg-blue-500"
                      : item.average >= 40
                      ? "bg-amber-500"
                      : "bg-rose-500";

                  return (
                    <div
                      key={item.subject}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{item.subject}</span>
                        <span className="font-black text-slate-900 dark:text-white">{item.average}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, Math.max(0, item.average))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {item.count} assessment{item.count > 1 ? "s" : ""} recorded
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assessment History & Results Section */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Toolbar: Filters and Search */}
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
              {/* Search input */}
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subject or assessment…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Subject filter */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Subjects</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Term filter */}
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Terms</option>
                  {availableTerms.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* Assessment Type filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Types</option>
                  <option value="CLASS_TEST">Class Test</option>
                  <option value="MID_TERM">Mid-Term</option>
                  <option value="TERM_TEST">Term Test</option>
                  <option value="FINAL">Final Exam</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="OTHER">Other</option>
                </select>

                {/* Sort Order */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "NEWEST" | "OLDEST" | "SCORE_HIGH" | "SCORE_LOW")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="SCORE_HIGH">Score: High to Low</option>
                  <option value="SCORE_LOW">Score: Low to High</option>
                </select>
              </div>
            </div>

            {/* Results Table */}
            {filteredMarks.length === 0 ? (
              <div className="p-8 text-center">
                <Filter className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  No matching results found
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Try adjusting your filter selection or search query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Assessment &amp; Term</th>
                      <th className="px-6 py-4">Score Obtained</th>
                      <th className="px-6 py-4">Total Marks</th>
                      <th className="px-6 py-4">Percentage</th>
                      <th className="px-6 py-4">Published Date</th>
                      <th className="px-6 py-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMarks.map((m) => {
                      const score = m.marksObtained ?? m.marks;
                      const pct = calculatePercentage(m);
                      const displayDate = formatScoreDate(m.publishedAt || m.recordedAt);

                      return (
                        <tr
                          key={m.id}
                          className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                        >
                          {/* Subject */}
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {m.subject}
                          </td>

                          {/* Assessment Type & Term */}
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {m.assessmentType ? m.assessmentType.replace("_", " ") : "Assessment"}
                            </span>
                            {m.term && (
                              <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {m.term}
                              </span>
                            )}
                          </td>

                          {/* Marks Obtained */}
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                            {score !== undefined ? score : "—"}
                          </td>

                          {/* Total Marks */}
                          <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                            / {m.totalMarks ?? "—"}
                          </td>

                          {/* Percentage Badge */}
                          <td className="px-6 py-4 font-black">
                            {pct !== null ? (
                              <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                                  pct >= 75
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : pct >= 60
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                    : pct >= 40
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                }`}
                              >
                                {pct.toFixed(1)}%
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Published Date */}
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {displayDate}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Published
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500">
              Showing {filteredMarks.length} of {marks.length} published results
            </div>
          </section>
        </>
      )}
    </div>
  );
}
