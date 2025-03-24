import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const appointments = await prisma.appointment.findMany({
          include: {
            patient: true,
            doctor: true,
          },
          orderBy: {
            date: 'asc',
          },
        });

        return res.status(200).json(appointments);

      case 'POST':
        const appointment = await prisma.appointment.create({
          data: req.body,
          include: {
            patient: true,
            doctor: true,
          },
        });

        return res.status(201).json(appointment);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Appointments API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 