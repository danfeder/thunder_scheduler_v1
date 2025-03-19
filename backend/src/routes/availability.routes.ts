import { Router, Request, Response, NextFunction } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { AsyncRequestHandler } from '../types/express';
import prisma from '../lib/prisma';

const router = Router();
const scheduleService = new ScheduleService(prisma);

// Get availability for a specific date
const getAvailabilityByDate: AsyncRequestHandler<{ date: string }> = async (req, res) => {
  const date = new Date(req.params.date);
  const availability = await scheduleService.getTeacherAvailabilityByDate(date);
  res.json({
    data: availability,
    success: true
  });
};

// Update availability for a specific date
const updateAvailability: AsyncRequestHandler<{}, any, { 
  date: string;
  blockedPeriods: number[];
  reason?: string;
}> = async (req, res) => {
  const { date, blockedPeriods, reason } = req.body;
  
  const availability = await scheduleService.createTeacherAvailability({
    date: new Date(date),
    blockedPeriods,
    reason
  });

  res.json({
    data: availability,
    success: true
  });
};

// Error wrapper for async handlers
const asyncHandler = <P = {}, ResBody = any, ReqBody = any>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody>
) => {
  return async (
    req: Request<P, ResBody, ReqBody>,
    res: Response<ResBody>,
    next: NextFunction
  ) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Register routes
router.get('/:date', asyncHandler<{ date: string }>(getAvailabilityByDate));
router.post('/', asyncHandler(updateAvailability));

export default router;