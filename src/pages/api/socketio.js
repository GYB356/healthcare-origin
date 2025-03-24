import { Server } from "socket.io";
import { verifyToken } from "../../utils/jwt";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  console.log("Setting up socket");
  const io = new Server(res.socket.server, {
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = await verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.user.id);

    // Join role-specific room
    socket.join(socket.user.role);

    // Handle appointment updates
    socket.on("appointment:update", (data) => {
      // Broadcast to relevant users based on role
      if (data.providerId) {
        io.to("provider").to(data.providerId).emit("appointment:updated", data);
      }
      if (data.patientId) {
        io.to("patient").to(data.patientId).emit("appointment:updated", data);
      }
      io.to("admin").emit("appointment:updated", data);
    });

    // Handle task updates
    socket.on("task:update", (data) => {
      io.to(data.assignedTo).emit("task:updated", data);
      io.to("admin").emit("task:updated", data);
    });

    // Handle notifications
    socket.on("notification:create", (data) => {
      io.to(data.userId).emit("notification:new", data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.user.id);
    });
  });

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler; 