export enum Day {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY'
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface Period {
  id: number;
}

export interface Assignment {
  classId: string;
  day: Day;
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
  day: Day;
  period: number;
  type: 'teacher' | 'class' | 'time';
  message: string;
}

// Helper function to convert between Day enum and DayOfWeek string
export const convertDay = {
  toEnum: (day: DayOfWeek): Day => {
    const map: Record<DayOfWeek, Day> = {
      'Monday': Day.MONDAY,
      'Tuesday': Day.TUESDAY,
      'Wednesday': Day.WEDNESDAY,
      'Thursday': Day.THURSDAY,
      'Friday': Day.FRIDAY
    };
    return map[day];
  },
  toString: (day: Day): DayOfWeek => {
    const map: Record<Day, DayOfWeek> = {
      [Day.MONDAY]: 'Monday',
      [Day.TUESDAY]: 'Tuesday',
      [Day.WEDNESDAY]: 'Wednesday',
      [Day.THURSDAY]: 'Thursday',
      [Day.FRIDAY]: 'Friday'
    };
    return map[day];
  }
};