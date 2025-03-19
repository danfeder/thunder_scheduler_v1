import { Schedule, Assignment, Period, Day } from '../../types/schedule.types';
import { Class, DailyConflicts, TeacherAvailability } from '../../types/class.types';

/**
 * Generate a mock schedule for testing
 */
export const mockSchedule = (id: string): Schedule => {
  const periods: Period[] = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1
  }));

  const assignments: Assignment[] = [
    { classId: '1', day: Day.MONDAY, period: 1, week: 1 },
    { classId: '2', day: Day.TUESDAY, period: 2, week: 1 },
    { classId: '3', day: Day.WEDNESDAY, period: 3, week: 1 },
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
  const days: Day[] = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY
  ];
  
  const conflicts: DailyConflicts[] = days.map(day => ({
    day,
    periods: day === Day.FRIDAY ? [4, 5] : [], // Example: No classes on Friday afternoon
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