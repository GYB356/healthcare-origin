import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const schedules = await prisma.schedule.findMany({
          include: {
            doctor: true,
          },
          orderBy: {
            date: 'asc',
          },
        });

        return res.status(200).json(schedules);

      case 'POST':
        const schedule = await prisma.schedule.create({
          data: req.body,
          include: {
            doctor: true,
          },
        });

        return res.status(201).json(schedule);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Schedules API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 