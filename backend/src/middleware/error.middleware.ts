import { Request, Response, NextFunction } from 'express';

interface PrismaError extends Error {
  code?: string;
  meta?: Record<string, any>;
  clientVersion?: string;
}

export const errorHandler = (
  err: PrismaError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  console.error('Error:', {
    message: err.message,
    code: err.code,
    meta: err.meta,
    stack: err.stack
  });
  
  // Handle Prisma errors
  if (err.code?.startsWith('P')) {
    // P2002: Unique constraint violation, P2014: Foreign key violation, etc.
    res.status(400).json({
      error: 'Bad Request',
      message: err.message,
      code: err.code
    });
    return;
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};