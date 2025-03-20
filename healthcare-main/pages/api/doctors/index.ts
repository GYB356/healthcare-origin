import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: 'doctor',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    return res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 