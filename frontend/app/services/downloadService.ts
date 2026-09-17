import { API_BASE_URL, apiClient } from "./apiService";

function backendFileUrl(fileUrl: string): string {
  const safeUploadPath = /^\/uploads\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\.(pdf|png|jpg|jpeg|doc|docx|txt)$/;
  if (!safeUploadPath.test(fileUrl)) {
    throw new Error("The attachment path is invalid or is hosted outside CampusCore.");
  }
  if (typeof window === "undefined") throw new Error("Attachments can only be downloaded in the browser.");
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    const backendOrigin = new URL(API_BASE_URL).origin;
    return new URL(fileUrl, backendOrigin).toString();
  }
  return new URL(fileUrl, window.location.origin).toString();
}

export async function downloadProtectedFile(fileUrl: string, suggestedName = "attachment") {
  const response = await apiClient.get<Blob>(backendFileUrl(fileUrl), { responseType: "blob" });
  const objectUrl = URL.createObjectURL(response.data);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = suggestedName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}
