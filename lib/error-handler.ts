import { NextApiResponse } from 'next';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  DATABASE = 'DATABASE_ERROR',
  SERVER = 'SERVER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
}

// Error handler for API routes
export const handleApiError = (
  error: unknown, 
  res: NextApiResponse
) => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  // Handle Prisma errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const fields = prismaError.meta?.target?.join(', ') || 'field';
      return res.status(409).json({
        error: `Resource already exists with this ${fields}`,
        type: ErrorType.VALIDATION,
      });
    }
    
    if (prismaError.code === 'P2025') {
      // Record not found
      return res.status(404).json({
        error: 'Resource not found',
        type: ErrorType.NOT_FOUND,
      });
    }
  }
  
  // Default to internal server error
  return res.status(500).json({
    error: 'Internal server error',
    type: ErrorType.SERVER,
  });
};

// Client-side error handling utility
export const handleClientError = (error: unknown): { message: string; type: ErrorType } => {
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return { message: 'You must be logged in', type: ErrorType.AUTHENTICATION };
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return { message: 'You do not have permission', type: ErrorType.AUTHORIZATION };
    }
    
    if (error.message.includes('404') || error.message.includes('Not found')) {
      return { message: 'Resource not found', type: ErrorType.NOT_FOUND };
    }
    
    if (error.message.includes('429') || error.message.includes('Too many requests')) {
      return { message: 'Too many requests, please try again later', type: ErrorType.RATE_LIMIT };
    }
    
    return { message: error.message, type: ErrorType.SERVER };
  }
  
  return { message: 'An unexpected error occurred', type: ErrorType.SERVER };
}; 