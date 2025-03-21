import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { role } = req.query;

    if (!role || typeof role !== 'string' || !Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ error: 'Invalid role parameter' });
    }

    const users = await prisma.user.findMany({
      where: {
        role: role as UserRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 