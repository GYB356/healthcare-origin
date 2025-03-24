import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface UserSocket {
  userId: string;
  socketId: string;
}

export const initWebSocket = (server: HttpServer, pool: Pool) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3007",
      methods: ["GET", "POST"],
    },
  });

  // Store connected users
  const connectedUsers: UserSocket[] = [];

  // Helper function to get user's socket
  const getUserSocket = (userId: string): Socket | null => {
    const userSocket = connectedUsers.find((user) => user.userId === userId);
    if (!userSocket) return null;
    return io.sockets.sockets.get(userSocket.socketId) || null;
  };

  // Helper function to get user's unread message count
  const getUnreadCount = async (userId: string): Promise<number> => {
    const result = await pool.query(
      "SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND read = false",
      [userId],
    );
    return parseInt(result.rows[0].count);
  };

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Handle user authentication
    socket.on("authenticate", async (userId: string) => {
      connectedUsers.push({ userId, socketId: socket.id });
      console.log(`User ${userId} authenticated with socket ${socket.id}`);

      // Send initial unread count
      const unreadCount = await getUnreadCount(userId);
      socket.emit("unreadCount", unreadCount);
    });

    // Handle new message
    socket.on("sendMessage", async (message: Omit<Message, "id" | "timestamp" | "read">) => {
      try {
        const messageId = uuidv4();
        const timestamp = new Date();

        // Store message in database
        await pool.query(
          `INSERT INTO messages (id, sender_id, receiver_id, content, timestamp, read)
           VALUES ($1, $2, $3, $4, $5, false)`,
          [messageId, message.senderId, message.receiverId, message.content, timestamp],
        );

        // Emit to receiver if online
        const receiverSocket = getUserSocket(message.receiverId);
        if (receiverSocket) {
          receiverSocket.emit("newMessage", {
            id: messageId,
            ...message,
            timestamp,
            read: false,
          });

          // Update unread count for receiver
          const unreadCount = await getUnreadCount(message.receiverId);
          receiverSocket.emit("unreadCount", unreadCount);
        }

        // Confirm message sent to sender
        socket.emit("messageSent", {
          id: messageId,
          ...message,
          timestamp,
          read: false,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle message read status
    socket.on("markAsRead", async (messageId: string, userId: string) => {
      try {
        await pool.query("UPDATE messages SET read = true WHERE id = $1 AND receiver_id = $2", [
          messageId,
          userId,
        ]);

        // Update unread count for user
        const unreadCount = await getUnreadCount(userId);
        socket.emit("unreadCount", unreadCount);

        // Notify sender that message was read
        const message = await pool.query("SELECT sender_id FROM messages WHERE id = $1", [
          messageId,
        ]);

        if (message.rows.length > 0) {
          const senderSocket = getUserSocket(message.rows[0].sender_id);
          if (senderSocket) {
            senderSocket.emit("messageRead", messageId);
          }
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
        socket.emit("error", { message: "Failed to mark message as read" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const index = connectedUsers.findIndex((user) => user.socketId === socket.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
