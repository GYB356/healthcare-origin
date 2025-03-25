import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HttpServer) => {
  try {
    io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handle user authentication
      socket.on("authenticate", (userId) => {
        if (userId) {
          // Join a room specific to this user
          socket.join(`user-${userId}`);
          console.log(`User ${userId} authenticated on socket ${socket.id}`);
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    console.log("Socket.IO initialized successfully");
  } catch (error) {
    console.error("Error initializing Socket.IO:", error);
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    console.error("Socket.IO has not been initialized");
    return;
  }
  
  io.to(`user-${userId}`).emit(event, data);
}; 