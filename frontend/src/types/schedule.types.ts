export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface Period {
  id: number;
  startTime: string;
  endTime: string;
}

export interface Assignment {
  classId: string;
  day: DayOfWeek;
  period: number;
  week: number;
}

export interface Schedule {
  id: string;
  startDate: string;
  endDate: string;
  rotationWeeks: number;
  assignments: Assignment[];
  periods: Period[];
}

export interface ScheduleState {
  schedule: Schedule | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

export interface Conflict {
  classId: string;
  day: DayOfWeek;
  period: number;
  type: 'teacher' | 'class' | 'time';
  message: string;
}