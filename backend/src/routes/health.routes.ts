import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Used to verify that the backend is running
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || 'unknown'
  });
});

export default router;