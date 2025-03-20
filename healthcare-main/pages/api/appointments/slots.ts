import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

const WORKING_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
};

const SLOT_DURATION = 30; // minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Get all appointments for the doctor on the specified date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId as string,
        date: new Date(date as string),
        status: 'scheduled',
      },
      select: {
        time: true,
      },
    });

    // Create array of booked times
    const bookedTimes = appointments.map(app => app.time);

    // Generate all possible time slots
    const timeSlots = generateTimeSlots(bookedTimes);

    return res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function generateTimeSlots(bookedTimes: string[]): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time,
        available: !bookedTimes.includes(time),
      });
    }
  }

  return slots;
} 