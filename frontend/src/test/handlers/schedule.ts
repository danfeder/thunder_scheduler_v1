import { rest } from 'msw';
import { Schedule, Assignment, Conflict } from '../../types/schedule.types';
import { Class, DailyConflicts, TeacherAvailability } from '../../types/class.types';
import { mockSchedule, mockClass, mockTeacherAvailability } from '../fixtures';

// Base API URL
const API_URL = 'http://localhost:3000/api';

export const scheduleHandlers = [
  // Schedule endpoints
  rest.get(`${API_URL}/schedule/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({
      data: mockSchedule(id as string),
      success: true
    }));
  }),

  rest.get(`${API_URL}/schedule`, (req, res, ctx) => {
    return res(ctx.json({
      data: [mockSchedule('1'), mockSchedule('2')],
      success: true
    }));
  }),

  rest.post(`${API_URL}/schedule`, async (req, res, ctx) => {
    const newSchedule = await req.json() as Omit<Schedule, 'id'>;
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          ...newSchedule,
          id: 'new-schedule-id'
        },
        success: true
      })
    );
  }),

  rest.put(`${API_URL}/schedule/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const updates = await req.json() as Partial<Schedule>;
    const schedule = mockSchedule(id as string);
    
    return res(ctx.json({
      data: {
        ...schedule,
        ...updates
      },
      success: true
    }));
  }),

  rest.post(`${API_URL}/schedule/generate`, async (req, res, ctx) => {
    const params = await req.json() as {
      startDate: string;
      endDate: string;
      rotationWeeks: number;
    };
    
    return res(ctx.json({
      data: {
        ...mockSchedule('generated'),
        startDate: params.startDate,
        endDate: params.endDate,
        rotationWeeks: params.rotationWeeks
      },
      success: true
    }));
  }),

  rest.put(`${API_URL}/schedule/:id/assignments`, async (req, res, ctx) => {
    const { id } = req.params;
    const assignment = await req.json() as Assignment;
    const schedule = mockSchedule(id as string);
    
    // Add or update the assignment
    const updatedAssignments = [...schedule.assignments];
    const existingIndex = updatedAssignments.findIndex(
      a => a.classId === assignment.classId &&
           a.day === assignment.day &&
           a.period === assignment.period &&
           a.week === assignment.week
    );
    
    if (existingIndex >= 0) {
      updatedAssignments[existingIndex] = assignment;
    } else {
      updatedAssignments.push(assignment);
    }
    
    return res(ctx.json({
      data: {
        ...schedule,
        assignments: updatedAssignments
      },
      success: true
    }));
  }),

  rest.post(`${API_URL}/schedule/:id/validate`, async (req, res, ctx) => {
    const changes = await req.json() as Partial<Schedule>;
    
    // Mock validation - always valid in tests unless specific test overrides
    return res(ctx.json({
      data: {
        valid: true,
        conflicts: []
      },
      success: true
    }));
  }),

  rest.post(`${API_URL}/schedule/:id/resolve-conflicts`, (req, res, ctx) => {
    const { id } = req.params;
    const schedule = mockSchedule(id as string);
    
    return res(ctx.json({
      data: schedule,
      success: true
    }));
  }),

  // Get schedule conflicts
  rest.get(`${API_URL}/schedule/:id/conflicts`, (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({
      data: [
        {
          classId: '1',
          day: 'Monday',
          period: 3,
          type: 'class',
          message: 'Conflict with another class'
        }
      ],
      success: true
    }));
  }),

  // Class endpoints
  rest.get(`${API_URL}/class/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({
      data: mockClass(id as string),
      success: true
    }));
  }),

  rest.get(`${API_URL}/class`, (req, res, ctx) => {
    return res(ctx.json({
      data: [mockClass('1'), mockClass('2'), mockClass('3')],
      success: true
    }));
  }),

  rest.put(`${API_URL}/class/:id/conflicts`, async (req, res, ctx) => {
    const { id } = req.params;
    const conflicts = await req.json() as DailyConflicts[];
    
    return res(ctx.json({
      data: {
        ...mockClass(id as string),
        conflicts
      },
      success: true
    }));
  }),

  // Teacher availability endpoints
  rest.get(`${API_URL}/availability/:date`, (req, res, ctx) => {
    const { date } = req.params;
    return res(ctx.json({
      data: mockTeacherAvailability(date as string),
      success: true
    }));
  }),

  rest.put(`${API_URL}/availability`, async (req, res, ctx) => {
    const availability = await req.json() as TeacherAvailability;
    
    return res(ctx.json({
      data: availability,
      success: true
    }));
  })
];