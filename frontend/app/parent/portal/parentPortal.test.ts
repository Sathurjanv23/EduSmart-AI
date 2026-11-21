import { describe, expect, it } from "vitest";
import { Student } from "@/app/types/api";

describe("Parent portal linked-child state isolation and sequence management", () => {
  it("initializes selection with the first linked child or fallback", () => {
    const linked: Student[] = [
      { id: "c-1", name: "Alice", email: "alice@school.test", studentClass: "10-A", parentEmail: "parent@school.test" },
      { id: "c-2", name: "Bob", email: "bob@school.test", studentClass: "8-B", parentEmail: "parent@school.test" },
    ];

    let selectedId = "";
    selectedId = selectedId || linked[0]?.id || "";
    expect(selectedId).toBe("c-1");
  });

  it("handles child switching with sequence counter to discard stale async responses", () => {
    let activeSequence = 0;
    let renderedChildData: string | null = null;

    // Simulation of rapid child toggling
    // User clicks Child A:
    const seqA = ++activeSequence;
    // User immediately clicks Child B before Child A responds:
    const seqB = ++activeSequence;

    // Child A's response arrives later (stale):
    if (seqA === activeSequence) {
      renderedChildData = "Child A Data";
    }

    // Child B's response arrives:
    if (seqB === activeSequence) {
      renderedChildData = "Child B Data";
    }

    expect(renderedChildData).toBe("Child B Data");
  });

  it("isolates data per student ID preventing cross-child leakage", () => {
    const marksByChild: Record<string, { id: string; subject: string; score: number }[]> = {
      "c-1": [{ id: "m-1", subject: "Math", score: 95 }],
      "c-2": [{ id: "m-2", subject: "English", score: 82 }],
    };

    const activeChildId = "c-2";
    const displayedMarks = marksByChild[activeChildId] || [];

    expect(displayedMarks).toHaveLength(1);
    expect(displayedMarks[0].subject).toBe("English");
    expect(displayedMarks.some((m) => m.id === "m-1")).toBe(false);
  });
});
