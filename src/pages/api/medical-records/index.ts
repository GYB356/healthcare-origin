import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const medicalRecords = await prisma.medicalRecord.findMany({
          include: {
            patient: true,
            doctor: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json(medicalRecords);

      case 'POST':
        const medicalRecord = await prisma.medicalRecord.create({
          data: req.body,
          include: {
            patient: true,
            doctor: true,
          },
        });

        return res.status(201).json(medicalRecord);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Medical Records API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 