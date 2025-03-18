import { Schedule, Assignment, Period, DayOfWeek } from '../../types/schedule.types';
import { Class, DailyConflicts, TeacherAvailability } from '../../types/class.types';

/**
 * Generate a mock schedule for testing
 */
export const mockSchedule = (id: string): Schedule => {
  const periods: Period[] = [
    { id: 1, startTime: '08:00', endTime: '09:00' },
    { id: 2, startTime: '09:15', endTime: '10:15' },
    { id: 3, startTime: '10:30', endTime: '11:30' },
    { id: 4, startTime: '12:30', endTime: '13:30' },
    { id: 5, startTime: '13:45', endTime: '14:45' },
  ];

  const assignments: Assignment[] = [
    { classId: '1', day: 'Monday', period: 1, week: 1 },
    { classId: '2', day: 'Tuesday', period: 2, week: 1 },
    { classId: '3', day: 'Wednesday', period: 3, week: 1 },
  ];

  return {
    id,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    rotationWeeks: 2,
    periods,
    assignments,
  };
};

/**
 * Generate a mock class for testing
 */
export const mockClass = (id: string): Class => {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const conflicts: DailyConflicts[] = days.map(day => ({
    day,
    periods: day === 'Friday' ? [4, 5] : [], // Example: No classes on Friday afternoon
  }));

  return {
    id,
    name: `Class ${id}`,
    gradeLevel: parseInt(id) % 5 + 1,
    conflicts,
  };
};

/**
 * Generate mock teacher availability for testing
 */
export const mockTeacherAvailability = (date: string): TeacherAvailability => {
  return {
    id: `avail-${date}`,
    date,
    blockedPeriods: [1, 5], // Example: Teacher unavailable first and last period
    reason: 'Personal appointment',
  };
};

/**
 * Generate mock validation response
 */
export const mockValidationResponse = (valid: boolean = true) => {
  return {
    valid,
    conflicts: valid ? [] : ['Conflict 1', 'Conflict 2'],
  };
};