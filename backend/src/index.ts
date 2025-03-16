import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import classRoutes from './routes/class.routes';
import scheduleRoutes from './routes/schedule.routes';
import { errorHandler } from './middleware/error.middleware';

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/classes', classRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation available on http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

bootstrap().catch(console.error);