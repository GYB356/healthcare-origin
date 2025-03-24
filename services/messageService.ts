/**
 * Message Service
 */
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Message } from "@/types/Message";

// WebSocket connection variables
let socket: Socket | null = null;
let messageHandler: ((message: any) => void) | null = null;
let socketConnected = false;

// Server URL (would normally come from environment variables)
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:3001";

/**
 * Send a message to another user
 */
export const sendMessage = async (
  messageData: Partial<Message>,
): Promise<{
  success: boolean;
  message?: Message;
  error?: string;
}> => {
  try {
    // Validate required fields
    if (!messageData.senderId || !messageData.recipientId || !messageData.content) {
      return {
        success: false,
        error: "Sender ID, Recipient ID, and message content are required",
      };
    }

    const response = await axios.post("/api/messages", messageData);

    return {
      success: true,
      message: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to send message",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to send message. Please try again.",
    };
  }
};

/**
 * Get messages with filters
 */
export const getMessages = async (
  filters: {
    senderId?: string;
    recipientId?: string;
    userId?: string; // fetch messages where user is either sender or recipient
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {},
): Promise<{
  success: boolean;
  messages: Message[];
  error?: string;
}> => {
  try {
    // Process Date objects for API
    const params: any = { ...filters };
    if (params.startDate instanceof Date) {
      params.startDate = params.startDate.toISOString();
    }
    if (params.endDate instanceof Date) {
      params.endDate = params.endDate.toISOString();
    }

    const response = await axios.get("/api/messages", { params });

    return {
      success: true,
      messages: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to fetch messages",
        messages: [],
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to fetch messages. Please try again.",
      messages: [],
    };
  }
};

/**
 * Mark a message as read
 */
export const markAsRead = async (
  messageId: string,
): Promise<{
  success: boolean;
  message?: Message;
  error?: string;
}> => {
  try {
    const response = await axios.patch(`/api/messages/${messageId}/read`);

    return {
      success: true,
      message: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to mark message as read",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to mark message as read. Please try again.",
    };
  }
};

/**
 * Subscribe to real-time messages via WebSocket
 */
export const subscribeToNewMessages = (
  userId: string,
  onNewMessage: (message: Message) => void,
): void => {
  // Store callback for reconnection purposes
  messageHandler = onNewMessage;

  // Create socket connection if not already connected
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    // Setup event handlers
    socket.on("connect", () => {
      console.log("Connected to message server");
      socketConnected = true;
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from message server");
      socketConnected = false;
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);

      // Try to reconnect on error
      if (socket) {
        socket.disconnect();

        // Recreate the socket connection
        setTimeout(() => {
          subscribeToNewMessages(userId, onNewMessage);
        }, 3000);
      }
    });
  }

  // Remove any existing message handlers to avoid duplicates
  if (socketConnected) {
    socket.off("new_message");
  }

  // Register new message handler
  socket.on("new_message", (message) => {
    onNewMessage(message);
  });
};

/**
 * Unsubscribe from real-time messages
 */
export const unsubscribeFromNewMessages = (): void => {
  if (socket) {
    // Remove message handler
    socket.off("new_message");

    // Disconnect socket
    socket.disconnect();
    socket = null;
    socketConnected = false;
    messageHandler = null;
  }
};

/**
 * Get conversation history between two users
 */
export const getConversation = async (
  user1Id: string,
  user2Id: string,
  options: {
    page?: number;
    limit?: number;
  } = {},
): Promise<{
  success: boolean;
  messages: Message[];
  error?: string;
}> => {
  try {
    const params = {
      user1Id,
      user2Id,
      page: options.page || 1,
      limit: options.limit || 50,
    };

    const response = await axios.get("/api/messages/conversation", { params });

    return {
      success: true,
      messages: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to fetch conversation",
        messages: [],
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to fetch conversation. Please try again.",
      messages: [],
    };
  }
};

export default {
  sendMessage,
  getMessages,
  markAsRead,
  subscribeToNewMessages,
  unsubscribeFromNewMessages,
  getConversation,
};
