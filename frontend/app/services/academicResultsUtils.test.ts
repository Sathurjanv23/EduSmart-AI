import { describe, expect, it } from "vitest";
import {
  calculatePercentage,
  formatScoreDate,
  sanitizeCsvValue,
  sanitizeFilename,
} from "./academicResultsUtils";
import { MarkRecord } from "@/app/types/api";

describe("academicResultsUtils Security and Calculation Hardening", () => {
  describe("sanitizeCsvValue (CSV Injection Prevention - CWE-1236)", () => {
    it("neutralizes formula triggers by prefixing with single quote", () => {
      expect(sanitizeCsvValue("=1+1")).toBe("'=1+1");
      expect(sanitizeCsvValue("=cmd|' /C calc'!A0")).toBe("'=cmd|' /C calc'!A0");
      expect(sanitizeCsvValue("+SUM(A1:A10)")).toBe("'+SUM(A1:A10)");
      expect(sanitizeCsvValue("-50")).toBe("'-50");
      expect(sanitizeCsvValue("@IMPORTXML('http://evil.com')")).toBe("'@IMPORTXML('http://evil.com')");
      expect(sanitizeCsvValue("\tTabLeader")).toBe("'\tTabLeader");
      expect(sanitizeCsvValue("\rCarriageReturn")).toBe("'\rCarriageReturn");
      expect(sanitizeCsvValue("%20Encoded")).toBe("'%20Encoded");
    });

    it("leaves safe academic text unchanged", () => {
      expect(sanitizeCsvValue("Mathematics")).toBe("Mathematics");
      expect(sanitizeCsvValue("Grade 10-A")).toBe("Grade 10-A");
      expect(sanitizeCsvValue("John Doe")).toBe("John Doe");
      expect(sanitizeCsvValue("Good performance in class test")).toBe("Good performance in class test");
      expect(sanitizeCsvValue("")).toBe("");
    });
  });

  describe("sanitizeFilename (Preserving Unicode/Tamil and stripping illegal chars)", () => {
    it("preserves legitimate Tamil and Unicode student names", () => {
      expect(sanitizeFilename("சாத்து")).toBe("சாத்து");
      expect(sanitizeFilename("விஜித்குமார்")).toBe("விஜித்குமார்");
      expect(sanitizeFilename("José García")).toBe("José_García");
      expect(sanitizeFilename("Sathurjan Vijithkumar")).toBe("Sathurjan_Vijithkumar");
    });

    it("strips filesystem-illegal characters and replaces spaces with underscores", () => {
      expect(sanitizeFilename("Alice / Bob <Test>")).toBe("Alice___Bob__Test_");
      expect(sanitizeFilename('Bad:File*Name?|Test"')).toBe("Bad_File_Name__Test_");
      expect(sanitizeFilename("   ")).toBe("Student");
      expect(sanitizeFilename("")).toBe("Student");
    });
  });

  describe("calculatePercentage", () => {
    it("calculates percentage accurately for typical marks", () => {
      const record: MarkRecord = {
        id: "m-1",
        subject: "Science",
        marks: 75,
        totalMarks: 100,
        status: "PUBLISHED",
      };
      expect(calculatePercentage(record)).toBe(75);
    });

    it("handles valid zero mark without treating as null or missing", () => {
      const zeroRecord: MarkRecord = {
        id: "m-zero",
        subject: "Physics",
        marks: 0,
        totalMarks: 50,
        status: "PUBLISHED",
      };
      expect(calculatePercentage(zeroRecord)).toBe(0);
    });

    it("returns null for non-positive total marks or missing marks", () => {
      const invalidTotal: MarkRecord = {
        id: "m-inv",
        subject: "Math",
        marks: 10,
        totalMarks: 0,
      };
      expect(calculatePercentage(invalidTotal)).toBeNull();

      const missingScore: MarkRecord = {
        id: "m-miss",
        subject: "Math",
        totalMarks: 100,
      };
      expect(calculatePercentage(missingScore)).toBeNull();
    });
  });

  describe("formatScoreDate", () => {
    it("formats ISO timestamps into human-readable date strings", () => {
      const formatted = formatScoreDate("2026-11-20T12:00:00Z");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Nov");
    });

    it("falls back to dash on invalid or undefined dates", () => {
      expect(formatScoreDate(undefined)).toBe("—");
      expect(formatScoreDate("")).toBe("—");
      expect(formatScoreDate("not-a-date")).toBe("—");
    });
  });
});
