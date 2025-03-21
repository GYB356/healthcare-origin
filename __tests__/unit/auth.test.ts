import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { createMocks } from 'node-mocks-http';

jest.mock('next-auth/next');

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should return unauthorized for unauthenticated users', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      (getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const session = await getServerSession(req, res, authOptions);
      expect(session).toBeNull();
    });

    it('should return session for authenticated users', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      const mockSession = {
        user: {
          id: '1',
          email: 'doctor@example.com',
          role: 'doctor',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const session = await getServerSession(req, res, authOptions);
      expect(session).toEqual(mockSession);
    });
  });

  describe('Role-based Access', () => {
    it('should allow doctor access to protected routes', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: '1',
        },
      });

      const mockSession = {
        user: {
          id: '1',
          email: 'doctor@example.com',
          role: 'doctor',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const session = await getServerSession(req, res, authOptions);
      expect(session?.user.role).toBe('doctor');
    });

    it('should allow patient access to protected routes', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: '1',
        },
      });

      const mockSession = {
        user: {
          id: '1',
          email: 'patient@example.com',
          role: 'patient',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const session = await getServerSession(req, res, authOptions);
      expect(session?.user.role).toBe('patient');
    });
  });
}); 