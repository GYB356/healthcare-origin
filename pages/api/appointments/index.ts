import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res, session);
      case "POST":
        return await handlePost(req, res, session);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling appointment request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { role, id } = session.user;
  const { start, end, doctorId, patientId, status } = req.query;

  let where: any = {};

  // Apply date filters if provided
  if (start || end) {
    where.date = {};
    if (start) where.date.gte = new Date(start as string);
    if (end) where.date.lte = new Date(end as string);
  }

  // Apply status filter if provided
  if (status) {
    where.status = status;
  }

  // Apply role-based filters
  switch (role) {
    case UserRole.PATIENT:
      where.patientId = id;
      break;
    case UserRole.DOCTOR:
      where.doctorId = id;
      break;
    case UserRole.NURSE:
    case UserRole.STAFF:
    case UserRole.ADMIN:
      // Can view all appointments
      // Optionally filter by doctor or patient if provided
      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;
      break;
    default:
      return res.status(403).json({ error: "Forbidden" });
  }

  const appointments = await prisma.appointment.findMany({
    where,
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
    orderBy: {
      date: "asc",
    },
  });

  return res.status(200).json(appointments);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { role } = session.user;

  // Only staff, admin, and doctors can create appointments
  if (![UserRole.STAFF, UserRole.ADMIN, UserRole.DOCTOR].includes(role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { title, notes, date, startTime, endTime, patientId, doctorId, isVirtual, virtualLink } =
    req.body;

  // Validate required fields
  if (!title || !date || !startTime || !endTime || !patientId || !doctorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate date and time format
  const appointmentDate = new Date(date);
  const appointmentStartTime = new Date(startTime);
  const appointmentEndTime = new Date(endTime);

  if (
    isNaN(appointmentDate.getTime()) ||
    isNaN(appointmentStartTime.getTime()) ||
    isNaN(appointmentEndTime.getTime())
  ) {
    return res.status(400).json({ error: "Invalid date or time format" });
  }

  // Check for scheduling conflicts
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
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
    return res.status(409).json({ error: "Scheduling conflict detected" });
  }

  // Create the appointment
  const appointment = await prisma.appointment.create({
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
      status: "SCHEDULED",
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

  return res.status(201).json(appointment);
}
