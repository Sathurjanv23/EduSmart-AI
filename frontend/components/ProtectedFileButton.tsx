"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { downloadProtectedFile } from "@/app/services/downloadService";

export function ProtectedFileButton({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const download = async () => { setLoading(true); setError(""); try { await downloadProtectedFile(fileUrl, fileName); } catch (unknownError: unknown) { setError(unknownError instanceof Error ? unknownError.message : "Could not download the attachment."); } finally { setLoading(false); } };
  return <span className="mt-2 block"><button type="button" onClick={() => void download()} disabled={loading} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline disabled:opacity-60"><Download className="h-4 w-4" />{loading ? "Downloading…" : "Download attachment"}</button>{error && <span role="alert" className="mt-1 block text-xs text-rose-600">{error}</span>}</span>;
}
