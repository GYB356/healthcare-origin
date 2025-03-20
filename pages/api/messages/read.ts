import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { messageIds } = req.body;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'Invalid message IDs' });
      }

      // Update messages to read
      await prisma.message.updateMany({
        where: {
          id: {
            in: messageIds,
          },
          receiverId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      // Get updated unread count
      const unreadCount = await prisma.message.count({
        where: {
          receiverId: session.user.id,
          read: false,
        },
      });

      // Emit read status update through WebSocket
      const io = (global as any).io;
      if (io) {
        io.to(session.user.id).emit('unread_count_update', unreadCount);
      }

      return res.status(200).json({ success: true, unreadCount });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 