import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Missing conversation ID" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { patientProfile: true },
    });

    if (!user?.patientProfile) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // Verify that the conversation belongs to the patient
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        patientId: user.patientProfile.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mark all unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        read: false,
      },
      data: {
        read: true,
      },
    });

    return res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
