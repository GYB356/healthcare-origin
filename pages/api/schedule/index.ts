import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const schedules = await prisma.schedule.findMany({
          where: {
            doctorId: session.user.id,
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: "asc",
          },
        });
        return res.status(200).json({ schedules });
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch schedules" });
      }

    case "POST":
      try {
        const { startTime, endTime } = req.body;

        // Validate input
        if (!startTime || !endTime) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Check for conflicts
        const conflictingSchedule = await prisma.schedule.findFirst({
          where: {
            doctorId: session.user.id,
            OR: [
              {
                AND: [
                  { startTime: { lte: new Date(startTime) } },
                  { endTime: { gt: new Date(startTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: new Date(endTime) } },
                  { endTime: { gte: new Date(endTime) } },
                ],
              },
            ],
          },
        });

        if (conflictingSchedule) {
          return res.status(409).json({ error: "Time slot conflicts with existing schedule" });
        }

        const schedule = await prisma.schedule.create({
          data: {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            doctorId: session.user.id,
          },
        });

        return res.status(201).json(schedule);
      } catch (error) {
        return res.status(500).json({ error: "Failed to create schedule" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
