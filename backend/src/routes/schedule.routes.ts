import { Router, Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { AsyncRequestHandler } from '../types/express';
import prisma from '../lib/prisma';
import { ScheduleGenerationRequest } from '../types';

const router = Router();
const scheduleService = new ScheduleService(prisma);

// Get all schedules
const getAllSchedules: AsyncRequestHandler = async (_req, res) => {
  console.log('[DEBUG] Getting all schedules');
  const schedules = await scheduleService.getAllSchedules();
  console.log('[DEBUG] Schedules retrieved:', schedules);
  res.json({
    data: schedules,
    success: true
  });
};

// Get schedule by ID
const getScheduleById: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  try {
    console.log('[DEBUG] Getting schedule by ID:', req.params.id);
    const schedule = await scheduleService.getScheduleById(req.params.id);
    console.log('[DEBUG] Raw schedule retrieved:', JSON.stringify(schedule, null, 2));
    
    if (!schedule) {
      console.log('[DEBUG] Schedule not found');
      return res.status(404).json({
        error: 'Schedule not found',
        message: 'The requested schedule does not exist',
        success: false
      });
    }
    
    const response = {
      data: schedule,
      success: true
    };
    console.log('[DEBUG] Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('[DEBUG] Error in getScheduleById:', error);
    throw error;
  }
};

// Generate schedule
const generateSchedule: AsyncRequestHandler<{}, any, ScheduleGenerationRequest> = async (req, res) => {
  const request: ScheduleGenerationRequest = req.body;
  const schedule = await scheduleService.generateSchedule(request);
  res.json({
    data: schedule,
    success: true
  });
};

// Update schedule assignments
const updateScheduleAssignments: AsyncRequestHandler<
  { scheduleId: string },
  any,
  { assignments: any[] }
> = async (req, res) => {
  const { scheduleId } = req.params;
  const { assignments } = req.body;

  try {
    const updatedSchedule = await scheduleService.updateScheduleAssignments(scheduleId, assignments);
    res.json({
      data: updatedSchedule,
      success: true
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to update assignments',
      message: error.message,
      success: false
    });
  }
};

// Validate schedule
const validateSchedule: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  const validationResult = await scheduleService.validateSchedule(req.params.id, {
    maxClassesPerDay: 4,
    maxClassesPerWeek: 16,
    maxConsecutiveClasses: 2,
    requireBreakAfterClass: true
  });
  res.json({
    data: validationResult,
    success: true
  });
};

// Error wrapper for async handlers
const asyncHandler = <P = {}, ResBody = any, ReqBody = any>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody>
) => {
  return async (req: Request<P, ResBody, ReqBody>, res: Response<ResBody>, next: any) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Get schedule conflicts
const getScheduleConflicts: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  try {
    console.log('[DEBUG] Getting conflicts for schedule:', req.params.id);
    const conflicts = await scheduleService.getScheduleConflicts(req.params.id);
    console.log('[DEBUG] Conflicts retrieved:', conflicts);
    
    res.json({
      data: conflicts || [],
      success: true
    });
  } catch (error) {
    console.error('[DEBUG] Error in getScheduleConflicts:', error);
    res.status(500).json({
      error: 'Failed to get schedule conflicts',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
};

// Register routes
router.get('/', asyncHandler(getAllSchedules));
router.get('/:id', asyncHandler<{ id: string }>(getScheduleById));
router.post('/generate', asyncHandler<{}, any, ScheduleGenerationRequest>(generateSchedule));
router.put(
  '/:scheduleId/assignments',
  asyncHandler<{ scheduleId: string }, any, { assignments: any[] }>(updateScheduleAssignments)
);
router.get('/:id/validate', asyncHandler<{ id: string }>(validateSchedule));
router.get('/:id/conflicts', asyncHandler<{ id: string }>(getScheduleConflicts));

export default router;