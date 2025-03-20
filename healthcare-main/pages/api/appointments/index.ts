import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, session);
    case 'POST':
      return handlePost(req, res, session);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { patient: true }
    });

    if (!user?.patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: user.patient.id,
        date: {
          gte: new Date(),
        },
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { doctorId, date, time, type, notes } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user and their patient profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { patient: true }
    });

    if (!user?.patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Check if the time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        time,
        status: 'scheduled',
      },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.patient.id,
        doctorId,
        date: new Date(date),
        time,
        type,
        notes,
        status: 'scheduled',
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 