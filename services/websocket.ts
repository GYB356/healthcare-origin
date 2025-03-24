import { Server } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const initWebSocket = (server: NetServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Client ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle new messages
    socket.on(
      "send_message",
      async (data: {
        content: string;
        senderId: string;
        receiverId: string;
        conversationId: string;
      }) => {
        try {
          // Save message to database
          const message = await prisma.message.create({
            data: {
              content: data.content,
              senderId: data.senderId,
              receiverId: data.receiverId,
              conversationId: data.conversationId,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          });

          // Emit to conversation room
          io.to(data.conversationId).emit("new_message", message);

          // Emit unread count update to receiver
          const unreadCount = await prisma.message.count({
            where: {
              receiverId: data.receiverId,
              read: false,
            },
          });
          io.to(data.receiverId).emit("unread_count_update", unreadCount);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", "Failed to send message");
        }
      },
    );

    // Handle message read status
    socket.on("mark_as_read", async (data: { messageId: string; conversationId: string }) => {
      try {
        await prisma.message.update({
          where: { id: data.messageId },
          data: { read: true },
        });

        // Emit read status update to conversation room
        io.to(data.conversationId).emit("message_read", data.messageId);
      } catch (error) {
        console.error("Error marking message as read:", error);
        socket.emit("error", "Failed to mark message as read");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
