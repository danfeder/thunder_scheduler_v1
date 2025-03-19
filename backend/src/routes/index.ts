import { Router } from 'express';
import classRoutes from './class.routes';
import scheduleRoutes from './schedule.routes';
import healthRoutes from './health.routes';
import availabilityRoutes from './availability.routes';

const router = Router();

router.use('/class', classRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/health', healthRoutes);
router.use('/availability', availabilityRoutes);

export default router;