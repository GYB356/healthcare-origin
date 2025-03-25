import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check for dev environment
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Seed only available in development" });
  }

  // Get secret from query
  const { secret } = req.query;

  if (secret !== "dev-seed-secret") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Clear existing data - with safe error handling in case models don't exist yet
    try {
      await prisma.$transaction([
        prisma.message.deleteMany(),
        prisma.conversation.deleteMany(),
        prisma.session.deleteMany(),
        prisma.account.deleteMany(),
        prisma.user.deleteMany(),
      ]);
    } catch (error) {
      console.log("Error clearing data, likely models don't exist yet:", error);
    }

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
      },
    });

    // Create doctor users
    const doctor1 = await prisma.user.create({
      data: {
        name: "Dr. Smith",
        email: "doctor@example.com",
        password: hashedPassword,
        role: "DOCTOR",
        department: "Cardiology",
        specialty: "Cardiology",
        licenseNumber: "MD123456",
        phone: "555-123-4567",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
      },
    });

    const doctor2 = await prisma.user.create({
      data: {
        name: "Dr. Johnson",
        email: "johnson@example.com",
        password: hashedPassword,
        role: "DOCTOR",
        department: "Neurology",
        specialty: "Neurology",
        licenseNumber: "MD654321",
        phone: "555-987-6543",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
      },
    });

    // Create nurse users
    const nurse1 = await prisma.user.create({
      data: {
        name: "Nancy Nurse",
        email: "nurse@example.com",
        password: hashedPassword,
        role: "NURSE",
        department: "Cardiology",
        licenseNumber: "RN123456",
        phone: "555-111-2222",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
      },
    });

    // Create staff users
    const staff1 = await prisma.user.create({
      data: {
        name: "Sam Staff",
        email: "staff@example.com",
        password: hashedPassword,
        role: "STAFF",
        department: "Billing",
        phone: "555-333-4444",
        image: "https://randomuser.me/api/portraits/men/35.jpg",
      },
    });

    // Create patient users
    const patient1 = await prisma.user.create({
      data: {
        name: "Jane Doe",
        email: "patient@example.com",
        password: hashedPassword,
        role: "PATIENT",
        dateOfBirth: new Date("1985-05-15"),
        gender: "Female",
        phone: "555-555-5555",
        address: "123 Main St, Anytown, USA",
        emergencyContact: "John Doe, 555-666-7777",
        bloodType: "O+",
        image: "https://randomuser.me/api/portraits/women/90.jpg",
      },
    });

    const patient2 = await prisma.user.create({
      data: {
        name: "John Smith",
        email: "smith@example.com",
        password: hashedPassword,
        role: "PATIENT",
        dateOfBirth: new Date("1990-08-20"),
        gender: "Male",
        phone: "555-888-9999",
        address: "456 Oak Ave, Somewhere, USA",
        emergencyContact: "Jane Smith, 555-999-8888",
        bloodType: "A+",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    });

    // Create conversations
    const conversation1 = await prisma.conversation.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor1.id,
      },
    });

    const conversation2 = await prisma.conversation.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor2.id,
      },
    });

    const conversation3 = await prisma.conversation.create({
      data: {
        patientId: patient2.id,
        doctorId: doctor1.id,
      },
    });

    // Create messages
    await prisma.message.create({
      data: {
        content: "Hello Dr. Smith, I have been experiencing headaches lately.",
        senderId: patient1.id,
        receiverId: doctor1.id,
        conversationId: conversation1.id,
        read: true,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
    });

    await prisma.message.create({
      data: {
        content:
          "How long have you been experiencing them? Are they accompanied by any other symptoms?",
        senderId: doctor1.id,
        receiverId: patient1.id,
        conversationId: conversation1.id,
        read: true,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    });

    await prisma.message.create({
      data: {
        content: "For about a week now. I also feel a bit dizzy sometimes.",
        senderId: patient1.id,
        receiverId: doctor1.id,
        conversationId: conversation1.id,
        read: true,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
    });

    await prisma.message.create({
      data: {
        content:
          "I would like to schedule an appointment to check this further. Can you come in tomorrow?",
        senderId: doctor1.id,
        receiverId: patient1.id,
        conversationId: conversation1.id,
        read: false,
        createdAt: new Date(Date.now() - 900000), // 15 minutes ago
      },
    });

    return res.status(200).json({
      message: "Database seeded successfully",
      data: {
        users: [admin, doctor1, doctor2, nurse1, staff1, patient1, patient2],
        conversations: [conversation1, conversation2, conversation3],
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return res.status(500).json({ error: "Failed to seed database", details: error });
  }
}
