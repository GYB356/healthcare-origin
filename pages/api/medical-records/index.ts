import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { patientId } = req.query;
        const where = patientId 
          ? { patientId: String(patientId) }
          : session.user.role === 'PATIENT'
          ? { patientId: session.user.id }
          : {};

        const records = await prisma.medicalRecord.findMany({
          where,
          include: {
            patient: {
              select: {
                name: true,
              },
            },
            doctor: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json({ records });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch medical records' });
      }

    case 'POST':
      try {
        if (session.user.role !== 'DOCTOR') {
          return res.status(403).json({ error: 'Only doctors can create medical records' });
        }

        const {
          patientId,
          title,
          description,
          diagnosis,
          prescription,
          notes,
          bloodPressure,
          heartRate,
          temperature,
          respiratoryRate,
          oxygenSaturation,
          height,
          weight,
        } = req.body;

        const record = await prisma.medicalRecord.create({
          data: {
            patientId,
            doctorId: session.user.id,
            title,
            description,
            diagnosis,
            prescription,
            notes,
            bloodPressure,
            heartRate,
            temperature,
            respiratoryRate,
            oxygenSaturation,
            height,
            weight,
          },
        });

        return res.status(201).json(record);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create medical record' });
      }

    case 'PUT':
      try {
        if (session.user.role !== 'DOCTOR') {
          return res.status(403).json({ error: 'Only doctors can update medical records' });
        }

        const {
          id,
          title,
          description,
          diagnosis,
          prescription,
          notes,
          bloodPressure,
          heartRate,
          temperature,
          respiratoryRate,
          oxygenSaturation,
          height,
          weight,
        } = req.body;

        const record = await prisma.medicalRecord.update({
          where: { id },
          data: {
            title,
            description,
            diagnosis,
            prescription,
            notes,
            bloodPressure,
            heartRate,
            temperature,
            respiratoryRate,
            oxygenSaturation,
            height,
            weight,
          },
        });

        return res.status(200).json(record);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update medical record' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 