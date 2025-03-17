import { DayOfWeek } from './schedule.types';

export interface DailyConflicts {
  day: DayOfWeek;
  periods: number[];
}

export interface Class {
  id: string;
  name: string;
  gradeLevel: number;
  conflicts: DailyConflicts[];
}

export interface TeacherAvailability {
  id: string;
  date: string;
  blockedPeriods: number[];
  reason?: string;
}

export interface ClassState {
  classes: Class[];
  selectedClass: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ClassUpdatePayload {
  name?: string;
  gradeLevel?: number;
  conflicts?: DailyConflicts[];
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedClasses?: Class[];
  errors?: {
    line: number;
    message: string;
  }[];
}

export type ClassesResponse = APIResponse<Class[]>;
export type ClassResponse = APIResponse<Class>;
export type ImportResponse = APIResponse<ImportResult>;