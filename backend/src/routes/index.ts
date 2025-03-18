import { Router } from 'express';
import scheduleRoutes from './schedule.routes';
import classRoutes from './class.routes';
import healthRoutes from './health.routes';

const router = Router();

// Register routes
router.use('/schedule', scheduleRoutes);
router.use('/class', classRoutes);
router.use('/health', healthRoutes);

export default router;