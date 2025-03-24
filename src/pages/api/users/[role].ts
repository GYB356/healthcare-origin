import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { role } = req.query;

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const users = await prisma.user.findMany({
          where: {
            role: role.toUpperCase(),
          },
          include: {
            profile: true,
          },
        });

        return res.status(200).json(users);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Users API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}