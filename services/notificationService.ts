/**
 * Notification Service
 */
import axios from "axios";

export interface NotificationOptions {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: "low" | "normal" | "high";
  expiresAt?: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  priority: "low" | "normal" | "high";
  expiresAt?: Date;
}

/**
 * Send a notification to a user
 */
export const sendNotification = async (
  options: NotificationOptions,
): Promise<{
  success: boolean;
  notification?: Notification;
  error?: string;
}> => {
  try {
    // Validate required fields
    if (!options.recipientId || !options.type || !options.message) {
      return {
        success: false,
        error: "Recipient ID, type, and message are required",
      };
    }

    const response = await axios.post("/api/notifications", {
      ...options,
      priority: options.priority || "normal",
    });

    return {
      success: true,
      notification: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to send notification",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to send notification. Please try again.",
    };
  }
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (
  userId: string,
  options: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  } = {},
): Promise<{
  success: boolean;
  notifications: Notification[];
  unreadCount?: number;
  error?: string;
}> => {
  try {
    const params = {
      userId,
      unreadOnly: options.unreadOnly || false,
      page: options.page || 1,
      limit: options.limit || 20,
    };

    const response = await axios.get("/api/notifications", { params });

    return {
      success: true,
      notifications: response.data.notifications,
      unreadCount: response.data.unreadCount,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to fetch notifications",
        notifications: [],
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to fetch notifications. Please try again.",
      notifications: [],
    };
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await axios.patch(`/api/notifications/${notificationId}/read`);

    return {
      success: true,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to mark notification as read",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to mark notification as read. Please try again.",
    };
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (
  userId: string,
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await axios.patch(`/api/notifications/read-all`, { userId });

    return {
      success: true,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to mark all notifications as read",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to mark all notifications as read. Please try again.",
    };
  }
};

export default {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
