import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("./apiService", () => ({ apiRequest }));

import { gradeSubmission } from "./assignmentService";

describe("assignment grading contract", () => {
  beforeEach(() => apiRequest.mockReset().mockResolvedValue({ id: "submission-1" }));

  it("uses the backend marks field and PATCH endpoint", async () => {
    await gradeSubmission("submission/1", { marks: 72, feedback: "Good reasoning" });
    expect(apiRequest).toHaveBeenCalledWith(
      "/assignments/submissions/submission%2F1/grade",
      { method: "PATCH", body: { marks: 72, feedback: "Good reasoning" } },
    );
  });
});
