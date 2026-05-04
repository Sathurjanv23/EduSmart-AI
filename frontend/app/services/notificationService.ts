import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

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
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await axios.post(`${API_URL}/${id}/read`);
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await axios.post(`${API_URL}/user/${userId}/read-all`);
  }
};
