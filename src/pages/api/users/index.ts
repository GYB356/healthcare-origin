import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const users = await prisma.user.findMany({
          include: {
            profile: true,
          },
        });

        return res.status(200).json(users);

      case 'POST':
        const { password, ...userData } = req.body;
        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
          },
          include: {
            profile: true,
          },
        });

        return res.status(201).json(user);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Users API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 