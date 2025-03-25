import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/error-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const appointment = await prisma.appointment.findUnique({
          where: { id },
          include: {
            patient: true,
            doctor: true,
          },
        });

        if (!appointment) {
          throw new ApiError(404, 'Appointment not found');
        }

        return res.status(200).json(appointment);

      case 'PUT':
        const updatedAppointment = await prisma.appointment.update({
          where: { id },
          data: req.body,
          include: {
            patient: true,
            doctor: true,
          },
        });

        return res.status(200).json(updatedAppointment);

      case 'DELETE':
        await prisma.appointment.delete({
          where: { id },
        });

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    return handleApiError(error, res);
  }
} 