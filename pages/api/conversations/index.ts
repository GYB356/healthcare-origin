import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          patientId: session.user.id,
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'asc',
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
          },
        },
      });

      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 