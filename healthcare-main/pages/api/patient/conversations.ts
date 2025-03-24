import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // GET /api/patient/conversations - Get all conversations for the patient
  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const conversations = await prisma.conversation.findMany({
        where: {
          patientId: user.patientProfile.id,
        },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const formattedConversations = conversations.map((conversation) => {
        const lastMessage = conversation.messages[0];
        return {
          id: conversation.id,
          doctorId: conversation.doctorId,
          doctorName: `${conversation.doctor.user.firstName} ${conversation.doctor.user.lastName}`,
          specialty: conversation.doctor.specialty,
          lastMessage: lastMessage?.content || "No messages yet",
          lastMessageTime: lastMessage?.createdAt || conversation.createdAt,
          unreadCount: 0, // TODO: Implement unread count
        };
      });

      return res.status(200).json(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // POST /api/patient/conversations - Create a new conversation
  if (req.method === "POST") {
    try {
      const { doctorId } = req.body;

      if (!doctorId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          patientId: user.patientProfile.id,
          doctorId,
        },
      });

      if (existingConversation) {
        return res.status(400).json({ message: "Conversation already exists" });
      }

      const conversation = await prisma.conversation.create({
        data: {
          patient: {
            connect: { id: user.patientProfile.id },
          },
          doctor: {
            connect: { id: doctorId },
          },
        },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      const formattedConversation = {
        id: conversation.id,
        doctorId: conversation.doctorId,
        doctorName: `${conversation.doctor.user.firstName} ${conversation.doctor.user.lastName}`,
        specialty: conversation.doctor.specialty,
        lastMessage: "",
        lastMessageTime: conversation.createdAt,
        unreadCount: 0,
      };

      return res.status(201).json(formattedConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
