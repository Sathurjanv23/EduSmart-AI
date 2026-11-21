import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("./apiService", () => ({ apiRequest }));

import {
  addMarks,
  getMarksByClassAndSubject,
  getMarksByStudent,
  getMyMarks,
  updateMarks,
} from "./marksService";

describe("marksService API client integration", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it("getMarksByClassAndSubject constructs the correct query URL without examId", async () => {
    apiRequest.mockResolvedValueOnce([{ id: "m-1", subject: "Math", marks: 80, status: "DRAFT" }]);

    const result = await getMarksByClassAndSubject("GRADE-10-A", "Mathematics");

    expect(apiRequest).toHaveBeenCalledWith("/marks/class/GRADE-10-A/subject/Mathematics");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("m-1");
  });

  it("getMarksByClassAndSubject includes encoded examId when supplied", async () => {
    apiRequest.mockResolvedValueOnce([{ id: "m-2", examId: "exam-123", marks: 95 }]);

    const result = await getMarksByClassAndSubject("GRADE-10-A", "Mathematics", "exam-123");

    expect(apiRequest).toHaveBeenCalledWith(
      "/marks/class/GRADE-10-A/subject/Mathematics?examId=exam-123"
    );
    expect(result[0].marks).toBe(95);
  });

  it("addMarks sends POST request with correct payload and credentials", async () => {
    apiRequest.mockResolvedValueOnce({ id: "m-new", studentId: "s-1", marks: 85, totalMarks: 100, status: "DRAFT" });

    const input = {
      studentId: "s-1",
      subject: "Science",
      marks: 85,
      totalMarks: 100,
      assessmentType: "CLASS_TEST" as const,
      term: "Term 1",
      comments: "Great effort",
    };

    const result = await addMarks(input);

    expect(apiRequest).toHaveBeenCalledWith("/marks", {
      method: "POST",
      body: input,
    });
    expect(result.id).toBe("m-new");
    expect(result.status).toBe("DRAFT");
  });

  it("updateMarks sends PUT request to student-scoped resource ID", async () => {
    apiRequest.mockResolvedValueOnce({ id: "m-existing", marks: 90, totalMarks: 100 });

    const input = {
      studentId: "s-1",
      subject: "Science",
      marks: 90,
      totalMarks: 100,
    };

    const result = await updateMarks("m-existing", input);

    expect(apiRequest).toHaveBeenCalledWith("/marks/m-existing", {
      method: "PUT",
      body: input,
    });
    expect(result.marks).toBe(90);
  });

  it("getMyMarks calls /marks/me endpoint", async () => {
    apiRequest.mockResolvedValueOnce([{ id: "m-pub", marks: 88, status: "PUBLISHED" }]);

    const result = await getMyMarks();

    expect(apiRequest).toHaveBeenCalledWith("/marks/me");
    expect(result[0].status).toBe("PUBLISHED");
  });

  it("getMarksByStudent calls student-scoped URL with encoded ID", async () => {
    apiRequest.mockResolvedValueOnce([{ id: "m-s1", studentId: "student/1", marks: 75 }]);

    await getMarksByStudent("student/1");

    expect(apiRequest).toHaveBeenCalledWith("/marks/student/student%2F1");
  });
});
