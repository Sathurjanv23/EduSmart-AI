import type { InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import { downloadProtectedFile } from "./downloadService";
import { apiClient } from "./apiService";

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

  it("extracts filename from Content-Disposition header when available", async () => {
    const mockBlob = new Blob(["sample content"], { type: "application/pdf" });
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: mockBlob,
      status: 200,
      statusText: "OK",
      headers: {
        "content-disposition": 'attachment; filename="transcript_2026.pdf"',
      },
      config: {} as InternalAxiosRequestConfig,
    });

    let clickedDownloadName = "";
    (globalThis as { window?: unknown }).window = {
      location: { origin: "http://localhost:3000" },
      setTimeout: (fn: () => void) => fn(),
    };
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/mock-uuid");
    URL.revokeObjectURL = vi.fn();

    (globalThis as { document?: unknown }).document = {
      createElement: (tagName: string) => ({
        tagName,
        download: "",
        href: "",
        click() {
          clickedDownloadName = this.download;
        },
        remove: vi.fn(),
      }),
      body: {
        appendChild: vi.fn(),
      },
    };

    await downloadProtectedFile("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf", "fallback.pdf");
    expect(clickedDownloadName).toBe("transcript_2026.pdf");

    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { document?: unknown }).document;
    getSpy.mockRestore();
    vi.restoreAllMocks();
  });
});
