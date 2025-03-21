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
      // Verify ownership
      const schedule = await prisma.schedule.findUnique({
        where: { id: String(id) },
      });

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      if (schedule.doctorId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.schedule.delete({
        where: { id: String(id) },
      });

      return res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 