import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import rateLimit from "express-rate-limit";
import { z } from "zod";

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
export const applyRateLimit = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise<void>((resolve, reject) => {
    limiter(req, res, (result: Error | null) => {
      if (result instanceof Error) return reject(result);
      return resolve();
    });
  });
};

// Authentication middleware
export const withAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  requiredRoles?: ("doctor" | "patient")[],
) => {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  if (requiredRoles && !requiredRoles.includes(session.user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }

  return true;
};

// Message validation schema
export const messageSchema = z.object({
  content: z.string().min(1).max(500),
  conversationId: z.string().uuid(),
  receiverId: z.string().uuid(),
});

// Conversation validation schema
export const conversationSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
});

// User validation schema
export const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["doctor", "patient"]),
});

// Generic validation middleware
export const validateInput = <T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: boolean; data?: T; error?: string } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((e) => e.message).join(", ") };
    }
    return { success: false, error: "Invalid input" };
  }
};
