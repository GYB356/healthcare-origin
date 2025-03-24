import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const messages = await prisma.message.findMany({
          where: {
            conversationId: id
          },
          include: {
            sender: true,
            receiver: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        return res.status(200).json(messages);

      case 'POST':
        const { content, senderId, receiverId } = req.body;

        if (!content || !senderId || !receiverId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const newMessage = await prisma.message.create({
          data: {
            content,
            senderId,
            receiverId,
            conversationId: id
          },
          include: {
            sender: true,
            receiver: true
          }
        });

        return res.status(201).json(newMessage);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Request error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 