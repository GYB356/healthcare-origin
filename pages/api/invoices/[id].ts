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

  switch (req.method) {
    case 'DELETE':
      try {
        if (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Only staff can delete invoices' });
        }

        // Verify invoice exists
        const invoice = await prisma.invoice.findUnique({
          where: { id: String(id) },
        });

        if (!invoice) {
          return res.status(404).json({ error: 'Invoice not found' });
        }

        await prisma.invoice.delete({
          where: { id: String(id) },
        });

        return res.status(200).json({ message: 'Invoice deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete invoice' });
      }

    case 'PATCH':
      try {
        if (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Only staff can update invoice status' });
        }

        const { status } = req.body;

        if (!['PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }

        const invoice = await prisma.invoice.update({
          where: { id: String(id) },
          data: { status },
        });

        return res.status(200).json(invoice);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update invoice status' });
      }

    default:
      res.setHeader('Allow', ['DELETE', 'PATCH']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 