// Base types that match our Prisma schema
export enum Day {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY'
}

// Base interfaces matching Prisma models
export interface BaseClass {
  id: string;
  name: string;
  gradeLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseConflict {
  id: string;
  day: Day;
  periods: number[];
  classId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  rotationWeeks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseAssignment {
  id: string;
  day: Day;
  period: number;
  week: number;
  classId: string;
  scheduleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseTeacherAvailability {
  id: string;
  date: Date;
  blockedPeriods: number[];
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relationships
export interface ClassWithConflicts extends BaseClass {
  conflicts: BaseConflict[];
}

export interface ScheduleWithAssignments extends BaseSchedule {
  assignments: BaseAssignment[];
}

// Input types for creation
export interface ClassCreate {
  name: string;
  gradeLevel: number;
  conflicts: ConflictCreate[];
}

export interface ConflictCreate {
  day: Day;
  periods: number[];
}

export interface TeacherAvailabilityCreate {
  date: Date;
  blockedPeriods: number[];
  reason?: string;
}

export interface ScheduleCreate {
  startDate: Date;
  endDate: Date;
  rotationWeeks: number;
}

export interface AssignmentCreate {
  day: Day;
  period: number;
  week: number;
  classId: string;
  scheduleId: string;
}

// Scheduling types
export interface ScheduleConstraints {
  maxClassesPerDay: number;
  maxClassesPerWeek: number;
  maxConsecutiveClasses: number;
  requireBreakAfterClass: boolean;
}

export interface ScheduleGenerationRequest {
  startDate: Date;
  endDate: Date;
  rotationWeeks: number;
  constraints: ScheduleConstraints;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}