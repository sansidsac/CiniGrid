import api from './api';

export const notificationService = {
  // Get notifications for a user
  getNotifications: async (userId: string, projectId?: string, page = 1, limit = 20, unreadOnly = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unreadOnly: unreadOnly.toString(),
      });
      
      if (projectId) {
        params.append('projectId', projectId);
      }

      const response = await api.get(`/notifications/user/${userId}?${params}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        unreadCount: response.data.unreadCount,
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        data: [],
        pagination: {},
        unreadCount: 0,
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string, projectId?: string) => {
    try {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await api.patch(`/notifications/user/${userId}/read-all${params}`);
      return {
        success: true,
        message: response.data.message,
        modifiedCount: response.data.modifiedCount,
      };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notifications as read',
      };
    }
  },

  // Send schedule notification
  sendScheduleNotification: async (itemId: string, itemType: 'scene' | 'task', projectId: string) => {
    try {
      const response = await api.post('/notifications/schedule', {
        itemId,
        itemType,
        projectId,
      });
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Error sending schedule notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send schedule notification',
      };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification',
      };
    }
  },

  // Get unread count
  getUnreadCount: async (userId: string, projectId?: string) => {
    try {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await api.get(`/notifications/user/${userId}/unread-count${params}`);
      return {
        success: true,
        unreadCount: response.data.data.unreadCount,
      };
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return {
        success: false,
        unreadCount: 0,
        message: error.response?.data?.message || 'Failed to get unread count',
      };
    }
  },
};