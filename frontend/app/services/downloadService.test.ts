import { describe, expect, it } from "vitest";
import { downloadProtectedFile } from "./downloadService";

describe("protected attachment downloads", () => {
  it("rejects caller-controlled absolute origins before making a request", async () => {
    await expect(
      downloadProtectedFile("https://evil.example/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"),
    ).rejects.toThrow("invalid or is hosted outside CampusCore");
  });

  it("rejects upload path traversal and unapproved file extensions", async () => {
    await expect(
      downloadProtectedFile("/uploads/../550e8400-e29b-41d4-a716-446655440000.html"),
    ).rejects.toThrow("invalid or is hosted outside CampusCore");
  });
});
