import { apiRequest } from "./apiService";
import { Announcement } from "@/app/types/api";
import { Role } from "./authService";

export async function addAnnouncement(announcementData: {
  title: string;
  content: string;
  visibleTo: Role[];
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category?: string;
  attachmentUrl?: string;
  publishedAt?: string;
  expiresAt?: string;
}) {
  return apiRequest<Announcement>("/announcements", { method: "POST", body: announcementData });
}

export async function getAllAnnouncements() {
  return apiRequest<Announcement[]>("/announcements");
}

export async function deleteAnnouncement(id: string) {
  return apiRequest(`/announcements/${id}`, { method: "DELETE" });
}
