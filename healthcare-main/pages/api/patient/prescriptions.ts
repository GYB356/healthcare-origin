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

    const { filter } = req.query;

    // Build where clause based on filter
    const where: any = {
      patientId: user.patient.id,
    };

    if (filter === "active") {
      where.status = "active";
      where.endDate = {
        gte: new Date(),
      };
    } else if (filter === "completed") {
      where.OR = [
        { status: "completed" },
        {
          endDate: {
            lt: new Date(),
          },
        },
      ];
    }

    // Get prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
