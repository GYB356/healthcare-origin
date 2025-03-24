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
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: {
            patient: true,
            doctor: true,
            messages: {
              include: {
                sender: true,
                receiver: true
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        });

        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }

        return res.status(200).json(conversation);

      case 'PUT':
        const updatedConversation = await prisma.conversation.update({
          where: { id },
          data: {
            ...req.body,
            updatedAt: new Date()
          },
          include: {
            patient: true,
            doctor: true,
            messages: {
              include: {
                sender: true,
                receiver: true
              }
            }
          }
        });

        return res.status(200).json(updatedConversation);

      case 'DELETE':
        await prisma.conversation.delete({
          where: { id }
        });

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Request error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 