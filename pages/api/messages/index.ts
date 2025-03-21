import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { getIO } from '../../../lib/socket';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { content, conversationId, receiverId } = req.body;

      // Validate input
      if (!content || !conversationId || !receiverId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify conversation exists and user is part of it
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          doctor: true,
          patient: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (
        conversation.doctorId !== session.user.id &&
        conversation.patientId !== session.user.id
      ) {
        return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          content,
          senderId: session.user.id,
          receiverId,
          conversationId,
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

      // Emit new message event through WebSocket
      const io = getIO();
      if (io) {
        io.to(conversationId).emit('new_message', message);

        // Update unread count for receiver
        const unreadCount = await prisma.message.count({
          where: {
            receiverId,
            read: false,
          },
        });
        io.to(receiverId).emit('unread_count_update', unreadCount);
      }

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: 'Failed to create message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 