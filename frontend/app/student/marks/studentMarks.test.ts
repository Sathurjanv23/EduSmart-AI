import { describe, expect, it } from "vitest";
import {
  calculatePercentage,
  formatScoreDate,
} from "../../services/academicResultsUtils";
import { MarkRecord } from "@/app/types/api";

describe("Student marks calculation and data formatting logic", () => {
  it("calculates percentage accurately for positive scores", () => {
    const mark: MarkRecord = {
      id: "m-1",
      subject: "Mathematics",
      marks: 85,
      totalMarks: 100,
      status: "PUBLISHED",
    };
    expect(calculatePercentage(mark)).toBe(85);
  });

  it("handles zero score as a valid percentage of 0%", () => {
    const mark: MarkRecord = {
      id: "m-0",
      subject: "History",
      marks: 0,
      totalMarks: 100,
      status: "PUBLISHED",
    };
    expect(calculatePercentage(mark)).toBe(0);
  });

  it("returns null when marks are undefined or totalMarks is zero or invalid", () => {
    const markWithoutScore: MarkRecord = {
      id: "m-none",
      subject: "Science",
      totalMarks: 100,
    };
    expect(calculatePercentage(markWithoutScore)).toBeNull();

    const markZeroTotal: MarkRecord = {
      id: "m-zero-tot",
      subject: "Art",
      marks: 10,
      totalMarks: 0,
    };
    expect(calculatePercentage(markZeroTotal)).toBeNull();
  });

  it("formats ISO date strings accurately and falls back on invalid values", () => {
    expect(formatScoreDate("2026-11-21T03:00:00Z")).toContain("2026");
    expect(formatScoreDate("")).toBe("—");
    expect(formatScoreDate(undefined)).toBe("—");
    expect(formatScoreDate("invalid-date-string")).toBe("—");
  });

  it("normalizes and averages assessments with different maximum scores without bias", () => {
    const marks: MarkRecord[] = [
      { id: "m-1", subject: "Math", marks: 90, totalMarks: 100 }, // 90%
      { id: "m-2", subject: "Math", marks: 40, totalMarks: 50 },  // 80%
      { id: "m-3", subject: "Math", marks: 14, totalMarks: 20 },  // 70%
    ];

    const percentages = marks
      .map(calculatePercentage)
      .filter((p): p is number => p !== null);

    const average = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    expect(average).toBe(80); // (90 + 80 + 70) / 3 = 80%
  });

  it("properly filters by subject and term", () => {
    const marks: MarkRecord[] = [
      { id: "m-1", subject: "Mathematics", term: "Term 1", marks: 80, totalMarks: 100 },
      { id: "m-2", subject: "Mathematics", term: "Term 2", marks: 85, totalMarks: 100 },
      { id: "m-3", subject: "Science", term: "Term 1", marks: 90, totalMarks: 100 },
    ];

    const mathTerm1 = marks.filter(
      (m) => m.subject === "Mathematics" && m.term === "Term 1"
    );
    expect(mathTerm1).toHaveLength(1);
    expect(mathTerm1[0].id).toBe("m-1");

    const allScience = marks.filter((m) => m.subject === "Science");
    expect(allScience).toHaveLength(1);
    expect(allScience[0].marks).toBe(90);
  });
});
