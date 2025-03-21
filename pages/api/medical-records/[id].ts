import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      if (session.user.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can delete medical records' });
      }

      // Verify record exists and belongs to the doctor
      const record = await prisma.medicalRecord.findUnique({
        where: { id: String(id) },
      });

      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      if (record.doctorId !== session.user.id) {
        return res.status(403).json({ error: 'You can only delete your own medical records' });
      }

      await prisma.medicalRecord.delete({
        where: { id: String(id) },
      });

      return res.status(200).json({ message: 'Medical record deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete medical record' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 