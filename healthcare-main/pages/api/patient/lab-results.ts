import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getSession({ req });

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user and their patient profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { patient: true },
    });

    if (!user?.patient) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const { filter } = req.query;

    // Build where clause based on filter
    const where: any = {
      patientId: user.patient.id,
    };

    if (filter === "recent") {
      where.date = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      };
    } else if (filter === "past") {
      where.date = {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Older than 30 days
      };
    }

    // Get lab results
    const results = await prisma.labResult.findMany({
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
        date: "desc",
      },
    });

    return res.status(200).json(results);
  } catch (error) {
    return handleApiError(error, res);
  }
}
