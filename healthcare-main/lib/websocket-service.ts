import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserSocket {
  userId: string;
  socketId: string;
}

class WebSocketService {
  private static instance: WebSocketService;
  private io: Server | null = null;
  private connectedUsers: UserSocket[] = [];

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("User connected:", socket.id);

      // Handle user authentication
      socket.on("authenticate", async (userId: string) => {
        this.connectedUsers.push({ userId, socketId: socket.id });
        console.log(`User ${userId} authenticated with socket ${socket.id}`);

        // Send initial unread count
        const unreadCount = await this.getUnreadCount(userId);
        socket.emit("unreadCount", unreadCount);
      });

      // Handle new message
      socket.on(
        "sendMessage",
        async (message: {
          senderId: string;
          receiverId: string;
          content: string;
          conversationId: string;
        }) => {
          try {
            // Store message in database
            const newMessage = await prisma.message.create({
              data: {
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                conversationId: message.conversationId,
                read: false,
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                },
              },
            });

            // Emit to receiver if online
            const receiverSocket = this.getUserSocket(message.receiverId);
            if (receiverSocket) {
              receiverSocket.emit("newMessage", newMessage);

              // Update unread count for receiver
              const unreadCount = await this.getUnreadCount(message.receiverId);
              receiverSocket.emit("unreadCount", unreadCount);
            }

            // Confirm message sent to sender
            socket.emit("messageSent", newMessage);
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        },
      );

      // Handle message read status
      socket.on("markAsRead", async (data: { messageId: string; userId: string }) => {
        try {
          await prisma.message.update({
            where: { id: data.messageId },
            data: { read: true },
          });

          // Update unread count for user
          const unreadCount = await this.getUnreadCount(data.userId);
          socket.emit("unreadCount", unreadCount);

          // Notify sender that message was read
          const message = await prisma.message.findUnique({
            where: { id: data.messageId },
            select: { senderId: true },
          });

          if (message) {
            const senderSocket = this.getUserSocket(message.senderId);
            if (senderSocket) {
              senderSocket.emit("messageRead", data.messageId);
            }
          }
        } catch (error) {
          console.error("Error marking message as read:", error);
          socket.emit("error", { message: "Failed to mark message as read" });
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const index = this.connectedUsers.findIndex((user) => user.socketId === socket.id);
        if (index !== -1) {
          this.connectedUsers.splice(index, 1);
        }
        console.log("User disconnected:", socket.id);
      });
    });
  }

  private getUserSocket(userId: string): Socket | null {
    const userSocket = this.connectedUsers.find((user) => user.userId === userId);
    if (!userSocket || !this.io) return null;
    return this.io.sockets.sockets.get(userSocket.socketId) || null;
  }

  private async getUnreadCount(userId: string): Promise<number> {
    return await prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }

  sendToUser(userId: string, event: string, data: any) {
    const socket = this.getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export default WebSocketService;
