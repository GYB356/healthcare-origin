import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, session, id);
      case 'PUT':
        return await handlePut(req, res, session, id);
      case 'DELETE':
        return await handleDelete(req, res, session, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling appointment request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  const { role, id: userId } = session.user;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          department: true,
          specialty: true,
        },
      },
    },
  });

  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Check if user has permission to view this appointment
  if (role === UserRole.PATIENT && appointment.patientId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (role === UserRole.DOCTOR && appointment.doctorId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(200).json(appointment);
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  const { role } = session.user;

  // Only staff, admin, and doctors can update appointments
  if (![UserRole.STAFF, UserRole.ADMIN, UserRole.DOCTOR].includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const {
    title,
    notes,
    date,
    startTime,
    endTime,
    patientId,
    doctorId,
    isVirtual,
    virtualLink,
    status,
  } = req.body;

  // Validate required fields
  if (!title || !date || !startTime || !endTime || !patientId || !doctorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate date and time format
  const appointmentDate = new Date(date);
  const appointmentStartTime = new Date(startTime);
  const appointmentEndTime = new Date(endTime);

  if (isNaN(appointmentDate.getTime()) || isNaN(appointmentStartTime.getTime()) || isNaN(appointmentEndTime.getTime())) {
    return res.status(400).json({ error: 'Invalid date or time format' });
  }

  // Check for scheduling conflicts (excluding the current appointment)
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      id: { not: id },
      doctorId,
      date: appointmentDate,
      OR: [
        {
          AND: [
            { startTime: { lte: appointmentStartTime } },
            { endTime: { gt: appointmentStartTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: appointmentEndTime } },
            { endTime: { gte: appointmentEndTime } },
          ],
        },
      ],
    },
  });

  if (conflictingAppointment) {
    return res.status(409).json({ error: 'Scheduling conflict detected' });
  }

  // Update the appointment
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      title,
      notes,
      date: appointmentDate,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      patientId,
      doctorId,
      isVirtual: isVirtual || false,
      virtualLink,
      status,
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          department: true,
          specialty: true,
        },
      },
    },
  });

  return res.status(200).json(appointment);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  const { role } = session.user;

  // Only staff and admin can delete appointments
  if (![UserRole.STAFF, UserRole.ADMIN].includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Check if appointment exists
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Delete the appointment
  await prisma.appointment.delete({
    where: { id },
  });

  return res.status(204).send(null);
} 