import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { db } from "@/lib/db";

interface UserSocket {
  userId: string;
  socketId: string;
  lastPing: number;
}

interface WebSocketEvent {
  type: string;
  payload: any;
}

class WebSocketService {
  private static instance: WebSocketService;
  private io: Server | null = null;
  private connectedUsers: Map<string, UserSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly PING_INTERVAL = 30000; // 30 seconds
  private readonly PING_TIMEOUT = 60000; // 60 seconds

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
      pingTimeout: this.PING_TIMEOUT,
      pingInterval: this.PING_INTERVAL,
      transports: ["websocket", "polling"],
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("User connected:", socket.id);

      // Set up ping monitoring
      const pingInterval = setInterval(() => {
        const userSocket = this.getUserSocketBySocketId(socket.id);
        if (userSocket) {
          const timeSinceLastPing = Date.now() - userSocket.lastPing;
          if (timeSinceLastPing > this.PING_TIMEOUT) {
            console.log(`User ${userSocket.userId} disconnected due to timeout`);
            this.handleDisconnect(socket);
          }
        }
      }, this.PING_INTERVAL);

      socket.on("authenticate", async (userId: string) => {
        try {
          this.connectedUsers.set(userId, {
            userId,
            socketId: socket.id,
            lastPing: Date.now(),
          });
        console.log(`User ${userId} authenticated with socket ${socket.id}`);

        // Send initial unread count
        const unreadCount = await this.getUnreadCount(userId);
        socket.emit("unreadCount", unreadCount);
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("error", { message: "Authentication failed" });
        }
      });

      socket.on("ping", () => {
        const userSocket = this.getUserSocketBySocketId(socket.id);
        if (userSocket) {
          userSocket.lastPing = Date.now();
          socket.emit("pong");
        }
      });

      socket.on("disconnect", () => {
        clearInterval(pingInterval);
        this.handleDisconnect(socket);
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
        this.handleError(socket, error);
      });
    });
  }

  private handleDisconnect(socket: Socket) {
    for (const [userId, userSocket] of this.connectedUsers.entries()) {
      if (userSocket.socketId === socket.id) {
        this.connectedUsers.delete(userId);
        this.reconnectAttempts.delete(userId);
        break;
      }
    }
  }

  private handleError(socket: Socket, error: Error) {
    const userId = this.getUserIdBySocket(socket);
    if (userId) {
      const attempts = this.reconnectAttempts.get(userId) || 0;
      if (attempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts.set(userId, attempts + 1);
        socket.connect();
      } else {
        this.connectedUsers.delete(userId);
        this.reconnectAttempts.delete(userId);
      }
    }
  }

  private getUserSocketBySocketId(socketId: string): UserSocket | null {
    for (const userSocket of this.connectedUsers.values()) {
      if (userSocket.socketId === socketId) {
        return userSocket;
      }
    }
    return null;
  }

  private getUserIdBySocket(socket: Socket): string | null {
    for (const [userId, userSocket] of this.connectedUsers.entries()) {
      if (userSocket.socketId === socket.id) {
        return userId;
      }
    }
    return null;
  }

  // Public methods for sending messages
  async sendToUser(userId: string, event: string, data: any) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket && this.io) {
      this.io.to(userSocket.socketId).emit(event, data);
    }
  }

  async broadcast(event: string, data: any, excludeUserId?: string) {
    if (!this.io) return;

    if (excludeUserId) {
      const excludeSocket = this.connectedUsers.get(excludeUserId);
      this.io.except(excludeSocket?.socketId || "").emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }

  // Cleanup method
  cleanup() {
    if (this.io) {
      this.io.close();
      this.io = null;
      this.connectedUsers.clear();
      this.reconnectAttempts.clear();
    }
  }
}

export const websocketService = WebSocketService.getInstance();
