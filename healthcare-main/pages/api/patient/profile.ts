import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          patientProfile: true,
        },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ error: "Patient profile not found" });
      }

      return res.status(200).json(user.patientProfile);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          patientProfile: true,
        },
      });

      if (!user?.patientProfile) {
        return res.status(404).json({ error: "Patient profile not found" });
      }

      const { dateOfBirth, gender, address, phoneNumber, emergencyContact } = req.body;

      const updatedProfile = await prisma.patientProfile.update({
        where: { id: user.patientProfile.id },
        data: {
          dateOfBirth,
          gender,
          address,
          phoneNumber,
          emergencyContact,
        },
      });

      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating patient profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
