import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { conversationId } = req.query;

  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }

  if (req.method === 'GET') {
    try {
      // Verify conversation exists and user is part of it
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          patient: true,
          doctor: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (
        conversation.patientId !== session.user.id &&
        conversation.doctorId !== session.user.id
      ) {
        return res.status(403).json({ error: 'Not authorized to view this conversation' });
      }

      // Fetch messages
      const messages = await prisma.message.findMany({
        where: {
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
        orderBy: {
          createdAt: 'asc',
        },
      });

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 