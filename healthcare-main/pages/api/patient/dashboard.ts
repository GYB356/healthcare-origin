import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getSession({ req });

    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user and their patient profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { patient: true },
    });

    if (!user?.patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        patientId: user.patient.id,
        date: {
          gte: new Date(),
        },
        status: "scheduled",
      },
    });

    // Get active prescriptions
    const activePrescriptions = await prisma.prescription.count({
      where: {
        patientId: user.patient.id,
        status: "active",
        endDate: {
          gte: new Date(),
        },
      },
    });

    // Get recent lab results (last 30 days)
    const recentLabResults = await prisma.labResult.count({
      where: {
        patientId: user.patient.id,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get medical history count
    const medicalHistory = await prisma.medicalHistory.count({
      where: {
        patientId: user.patient.id,
      },
    });

    return res.status(200).json({
      upcomingAppointments,
      activePrescriptions,
      recentLabResults,
      medicalHistory,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
