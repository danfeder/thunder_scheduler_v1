import { http, HttpResponse } from 'msw';
import { Schedule, Assignment, Conflict } from '../../types/schedule.types';
import { Class, DailyConflicts, TeacherAvailability } from '../../types/class.types';
import { mockSchedule, mockClass, mockTeacherAvailability } from '../fixtures';

// Base API URL
const API_URL = 'http://localhost:3000/api';

export const scheduleHandlers = [
  // Schedule endpoints
  http.get(`${API_URL}/schedule/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      data: mockSchedule(id as string),
      success: true
    });
  }),

  http.get(`${API_URL}/schedule`, () => {
    return HttpResponse.json({
      data: [mockSchedule('1'), mockSchedule('2')],
      success: true
    });
  }),

  http.post(`${API_URL}/schedule`, async ({ request }) => {
    const newSchedule = await request.json() as Omit<Schedule, 'id'>;
    return HttpResponse.json({
      data: {
        ...newSchedule,
        id: 'new-schedule-id'
      },
      success: true
    }, { status: 201 });
  }),

  http.put(`${API_URL}/schedule/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Schedule>;
    const schedule = mockSchedule(id as string);
    
    return HttpResponse.json({
      data: {
        ...schedule,
        ...updates
      },
      success: true
    });
  }),

  http.post(`${API_URL}/schedule/generate`, async ({ request }) => {
    const params = await request.json() as {
      startDate: string;
      endDate: string;
      rotationWeeks: number;
    };
    
    return HttpResponse.json({
      data: {
        ...mockSchedule('generated'),
        startDate: params.startDate,
        endDate: params.endDate,
        rotationWeeks: params.rotationWeeks
      },
      success: true
    });
  }),

  http.put(`${API_URL}/schedule/:id/assignments`, async ({ params, request }) => {
    const { id } = params;
    const assignment = await request.json() as Assignment;
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
    
    return HttpResponse.json({
      data: {
        ...schedule,
        assignments: updatedAssignments
      },
      success: true
    });
  }),

  http.post(`${API_URL}/schedule/:id/validate`, async ({ request }) => {
    const changes = await request.json() as Partial<Schedule>;
    
    // Mock validation - always valid in tests unless specific test overrides
    return HttpResponse.json({
      data: {
        valid: true,
        conflicts: []
      },
      success: true
    });
  }),

  http.post(`${API_URL}/schedule/:id/resolve-conflicts`, ({ params }) => {
    const { id } = params;
    const schedule = mockSchedule(id as string);
    
    return HttpResponse.json({
      data: schedule,
      success: true
    });
  }),

  // Get schedule conflicts
  http.get(`${API_URL}/schedule/:id/conflicts`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
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
    });
  }),

  // Class endpoints
  http.get(`${API_URL}/class/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      data: mockClass(id as string),
      success: true
    });
  }),

  http.get(`${API_URL}/class`, () => {
    return HttpResponse.json({
      data: [mockClass('1'), mockClass('2'), mockClass('3')],
      success: true
    });
  }),

  http.put(`${API_URL}/class/:id/conflicts`, async ({ params, request }) => {
    const { id } = params;
    const conflicts = await request.json() as DailyConflicts[];
    
    return HttpResponse.json({
      data: {
        ...mockClass(id as string),
        conflicts
      },
      success: true
    });
  }),

  // Teacher availability endpoints
  http.get(`${API_URL}/availability/:date`, ({ params }) => {
    const { date } = params;
    return HttpResponse.json({
      data: mockTeacherAvailability(date as string),
      success: true
    });
  }),

  http.put(`${API_URL}/availability`, async ({ request }) => {
    const availability = await request.json() as TeacherAvailability;
    
    return HttpResponse.json({
      data: availability,
      success: true
    });
  })
];