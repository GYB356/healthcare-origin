import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { doctorId, patientId } = req.body;

    // Validate input
    if (!doctorId || !patientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { doctorId },
          { patientId }
        ]
      }
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        doctorId,
        patientId,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        patient: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        messages: true,
      }
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
} 