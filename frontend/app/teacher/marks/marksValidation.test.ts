import { describe, expect, it } from "vitest";

describe("Teacher marks workspace row evaluation logic", () => {
  function validateScore(val: string, total: number): string | undefined {
    if (val.trim() === "") return undefined;
    const num = Number(val);
    if (!Number.isInteger(num)) return "Must be an integer";
    if (num < 0) return "Cannot be negative";
    if (num > total) return `Max is ${total}`;
    return undefined;
  }

  it("accepts valid integer marks including zero", () => {
    expect(validateScore("0", 100)).toBeUndefined();
    expect(validateScore("85", 100)).toBeUndefined();
    expect(validateScore("100", 100)).toBeUndefined();
    expect(validateScore("", 100)).toBeUndefined(); // Empty field is permitted (not entered)
  });

  it("rejects negative marks", () => {
    expect(validateScore("-1", 100)).toBe("Cannot be negative");
    expect(validateScore("-50", 100)).toBe("Cannot be negative");
  });

  it("rejects floating point values to prevent precision drift", () => {
    expect(validateScore("85.5", 100)).toBe("Must be an integer");
    expect(validateScore("0.2", 100)).toBe("Must be an integer");
  });

  it("rejects marks exceeding assessment maximum", () => {
    expect(validateScore("101", 100)).toBe("Max is 100");
    expect(validateScore("55", 50)).toBe("Max is 50");
  });

  it("calculates class average percentage accurately", () => {
    const scores = [
      { marks: "80", total: 100 },
      { marks: "90", total: 100 },
      { marks: "35", total: 50 }, // 70%
      { marks: "", total: 100 },   // unentered should not skew average
    ];

    let sum = 0;
    let count = 0;
    scores.forEach((s) => {
      if (s.marks.trim() !== "") {
        const val = parseInt(s.marks, 10);
        sum += (val / s.total) * 100;
        count++;
      }
    });

    const average = count > 0 ? Math.round(sum / count) : null;
    expect(average).toBe(80); // (80 + 90 + 70) / 3 = 80%
  });

  it("correctly identifies dirty and publish-locked rows", () => {
    const rows = {
      "s-1": { marks: "85", status: "DRAFT", isDirty: true },
      "s-2": { marks: "90", status: "PUBLISHED", isDirty: false },
      "s-3": { marks: "", status: "UNSAVED", isDirty: false },
    };

    const hasUnsaved = Object.values(rows).some((r) => r.isDirty);
    expect(hasUnsaved).toBe(true);

    const isLocked = rows["s-2"].status === "PUBLISHED";
    expect(isLocked).toBe(true);
  });
});
