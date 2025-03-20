import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // GET /api/patient/messages - Get messages for a conversation
  if (req.method === 'GET') {
    try {
      const { conversationId } = req.query;

      if (!conversationId || typeof conversationId !== 'string') {
        return res.status(400).json({ message: 'Missing conversation ID' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      // Verify that the conversation belongs to the patient
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          patientId: user.patientProfile.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId,
        },
        include: {
          sender: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const formattedMessages = messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        senderRole: message.sender.role.toLowerCase() as 'patient' | 'doctor',
      }));

      return res.status(200).json(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // POST /api/patient/messages - Send a new message
  if (req.method === 'POST') {
    try {
      const { conversationId, content } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      // Verify that the conversation belongs to the patient
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          patientId: user.patientProfile.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const message = await prisma.message.create({
        data: {
          content,
          conversation: {
            connect: { id: conversationId },
          },
          sender: {
            connect: { id: user.id },
          },
        },
        include: {
          sender: true,
        },
      });

      // Update conversation's updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      const formattedMessage = {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        senderRole: message.sender.role.toLowerCase() as 'patient' | 'doctor',
      };

      return res.status(201).json(formattedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 