import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { getIO } from "../../../../lib/socket";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messageId } = req.query;

  if (!messageId || typeof messageId !== "string") {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  try {
    // Update message read status
    const message = await prisma.message.update({
      where: {
        id: messageId,
        receiverId: session.user.id,
      },
      data: {
        read: true,
      },
    });

    // Get updated unread count for the user
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        read: false,
      },
    });

    // Emit WebSocket events
    const io = getIO();
    if (io) {
      io.to(session.user.id).emit("message_read", messageId);
      io.to(session.user.id).emit("unread_count_update", unreadCount);
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({ error: "Failed to mark message as read" });
  }
}
