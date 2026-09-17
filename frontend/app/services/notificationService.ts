import { apiRequest } from "./apiService";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string | null;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    return apiRequest<Notification[]>(`/notifications/user/${userId}`);
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiRequest(`/notifications/${id}/read`, { method: "POST" });
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await apiRequest(`/notifications/user/${userId}/read-all`, { method: "POST" });
  }
};
