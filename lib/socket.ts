import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'socket.io-client';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  if (!io) {
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId);
      });

      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
} 