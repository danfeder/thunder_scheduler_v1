import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleGenerationRequest, ScheduleConstraints, BaseAssignment } from '../types';
import { AsyncRequestHandler } from '../types/express';

const router = Router();
const scheduleService = new ScheduleService(prisma);

// Get all schedules
const getAllSchedules: AsyncRequestHandler = async (_req, res) => {
  const schedules = await scheduleService.getAllSchedules();
  res.json(schedules);
};

// Get a single schedule by ID
const getScheduleById: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  res.json(schedule);
};

// Generate a new schedule
const generateSchedule: AsyncRequestHandler<{}, any, ScheduleGenerationRequest> = async (req, res) => {
  const request: ScheduleGenerationRequest = req.body;
  
  // Validate request
  if (!request.startDate || !request.endDate || !request.rotationWeeks || !request.constraints) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Missing required fields'
    });
  }
  
  // Convert string dates to Date objects
  request.startDate = new Date(request.startDate);
  request.endDate = new Date(request.endDate);
  
  try {
    const schedule = await scheduleService.generateSchedule(request);
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Schedule generation failed',
      message: error.message
    });
  }
};

// Validate a schedule
const validateSchedule: AsyncRequestHandler<
  { id: string },
  any,
  { constraints: ScheduleConstraints }
> = async (req, res) => {
  const { id } = req.params;
  const { constraints } = req.body;
  
  if (!constraints) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Missing constraints'
    });
  }
  
  try {
    const validationResult = await scheduleService.validateSchedule(id, constraints);
    res.json(validationResult);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Schedule validation failed',
      message: error.message
    });
  }
};

// Delete a schedule
const deleteSchedule: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  try {
    const deletedSchedule = await scheduleService.deleteSchedule(req.params.id);
    res.json(deletedSchedule);
  } catch (error: any) {
    res.status(404).json({ 
      error: 'Schedule not found',
      message: error.message
    });
  }
};

// Update schedule assignments
const updateScheduleAssignments: AsyncRequestHandler<
  { id: string },
  any,
  { assignments: Omit<BaseAssignment, 'id' | 'createdAt' | 'updatedAt' | 'scheduleId'>[] }
> = async (req, res) => {
  const { id } = req.params;
  const { assignments } = req.body;
  
  if (!assignments || !Array.isArray(assignments)) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Missing or invalid assignments'
    });
  }
  
  try {
    const updatedSchedule = await scheduleService.updateScheduleAssignments(id, assignments);
    res.json(updatedSchedule);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Schedule update failed',
      message: error.message
    });
  }
};

// Create teacher availability
const createTeacherAvailability: AsyncRequestHandler<
  {},
  any,
  { date: string; blockedPeriods: number[]; reason?: string }
> = async (req, res) => {
  const { date, blockedPeriods, reason } = req.body;
  
  if (!date || !blockedPeriods) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Missing required fields'
    });
  }
  
  try {
    const availability = await scheduleService.createTeacherAvailability({
      date: new Date(date),
      blockedPeriods,
      reason
    });
    res.status(201).json(availability);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Failed to create teacher availability',
      message: error.message
    });
  }
};

// Delete teacher availability
const deleteTeacherAvailability: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  try {
    const deletedAvailability = await scheduleService.deleteTeacherAvailability(req.params.id);
    res.json(deletedAvailability);
  } catch (error: any) {
    res.status(404).json({ 
      error: 'Teacher availability not found',
      message: error.message
    });
  }
};

// Error wrapper for async handlers
const asyncHandler = <P = {}, ResBody = any, ReqBody = any>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody>
) => {
  return async (req: Request<P, ResBody, ReqBody>, res: Response<ResBody>, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Register routes
router.get('/', asyncHandler(getAllSchedules));
router.get('/:id', asyncHandler<{ id: string }>(getScheduleById));
router.post('/', asyncHandler<{}, any, ScheduleGenerationRequest>(generateSchedule));
router.post('/:id/validate', asyncHandler<{ id: string }, any, { constraints: ScheduleConstraints }>(validateSchedule));
router.delete('/:id', asyncHandler<{ id: string }>(deleteSchedule));
router.put('/:id/assignments', asyncHandler<{ id: string }, any, { assignments: any[] }>(updateScheduleAssignments));
router.post('/teacher-availability', asyncHandler<{}, any, { date: string; blockedPeriods: number[]; reason?: string }>(createTeacherAvailability));
router.delete('/teacher-availability/:id', asyncHandler<{ id: string }>(deleteTeacherAvailability));

export default router;