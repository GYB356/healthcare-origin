import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { role } = req.query;

  if (role !== 'doctors' && role !== 'patients') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: role === 'doctors' ? 'doctor' : 'patient',
        NOT: {
          id: session.user.id // Exclude current user
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
} 