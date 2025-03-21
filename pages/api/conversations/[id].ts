import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { applyRateLimit, withAuth } from '../../../lib/middleware';
import { handleApiError, ApiError } from '../../../lib/error-handler';
import { withCache, generateCacheKey } from '../../../lib/cache';
import { getIO } from '../../../lib/socket';

const prisma = new PrismaClient();

// Create cache middleware for this route
const conversationCache = withCache<any>(
  (req) => `conversation-${req.query.id}`,
  60 // 1 minute TTL
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await applyRateLimit(req, res);
    
    // Check authentication
    const isAuthenticated = await withAuth(req, res);
    if (!isAuthenticated) return;
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      throw new ApiError(400, 'Invalid conversation ID');
    }
    
    if (req.method === 'GET') {
      // Check cache first
      const cachedData = conversationCache.get(req);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }
      
      // Get conversation with messages
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      
      if (!conversation) {
        throw new ApiError(404, 'Conversation not found');
      }
      
      // Store in cache
      conversationCache.set(req, conversation);
      
      return res.status(200).json(conversation);
    } else if (req.method === 'PUT') {
      // Update conversation (e.g., archive)
      const { archived } = req.body;
      
      const updatedConversation = await prisma.conversation.update({
        where: { id },
        data: { archived: Boolean(archived) },
      });
      
      // Invalidate cache
      conversationCache.invalidate(req);
      
      return res.status(200).json(updatedConversation);
    } else if (req.method === 'DELETE') {
      // Delete conversation
      await prisma.message.deleteMany({
        where: { conversationId: id },
      });
      
      await prisma.conversation.delete({
        where: { id },
      });
      
      // Invalidate cache
      conversationCache.invalidate(req);
      
      // Notify clients via WebSocket
      const io = getIO();
      if (io) {
        io.to(id).emit('conversation_deleted', { id });
      }
      
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return handleApiError(error, res);
  }
} 