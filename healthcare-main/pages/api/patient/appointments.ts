import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET /api/patient/appointments - Get all appointments for the patient
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          patientProfile: true,
        },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          patientId: user.patientProfile.id,
        },
        include: {
          doctor: {
            include: {
              user: true,
              specialty: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      const formattedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        doctorName: appointment.doctor.user.name,
        specialty: appointment.doctor.specialty.name,
        status: appointment.status,
      }));

      return res.status(200).json(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /api/patient/appointments - Create a new appointment
  if (req.method === 'POST') {
    try {
      const { date, time, doctorId } = req.body;

      if (!date || !time || !doctorId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          patientProfile: true,
        },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }

      // Check if the time slot is available
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          date,
          time,
          status: 'scheduled',
        },
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Time slot is not available' });
      }

      const appointment = await prisma.appointment.create({
        data: {
          date,
          time,
          status: 'scheduled',
          patient: {
            connect: { id: user.patientProfile.id },
          },
          doctor: {
            connect: { id: doctorId },
          },
        },
        include: {
          doctor: {
            include: {
              user: true,
              specialty: true,
            },
          },
        },
      });

      const formattedAppointment = {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        doctorName: appointment.doctor.user.name,
        specialty: appointment.doctor.specialty.name,
        status: appointment.status,
      };

      return res.status(201).json(formattedAppointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /api/patient/appointments/:id - Update an appointment status
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          patientProfile: true,
        },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }

      const appointment = await prisma.appointment.update({
        where: {
          id: String(id),
          patientId: user.patientProfile.id,
        },
        data: {
          status,
        },
        include: {
          doctor: {
            include: {
              user: true,
              specialty: true,
            },
          },
        },
      });

      const formattedAppointment = {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        doctorName: appointment.doctor.user.name,
        specialty: appointment.doctor.specialty.name,
        status: appointment.status,
      };

      return res.status(200).json(formattedAppointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 