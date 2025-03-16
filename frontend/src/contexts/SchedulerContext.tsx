import { createContext, useContext, useState, ReactNode } from 'react';
import { Day } from '@/types';

interface SchedulerState {
  selectedClass: string | null;
  conflicts: Record<string, Record<Day, number[]>>;
  teacherAvailability: Record<string, number[]>;
  maxClassesPerDay: number;
  maxClassesPerWeek: number;
  requireBreakAfterClass: boolean;
}

interface SchedulerContextType extends SchedulerState {
  setSelectedClass: (classId: string | null) => void;
  setConflicts: (conflicts: Record<string, Record<Day, number[]>>) => void;
  setTeacherAvailability: (availability: Record<string, number[]>) => void;
  setMaxClassesPerDay: (max: number) => void;
  setMaxClassesPerWeek: (max: number) => void;
  setRequireBreakAfterClass: (require: boolean) => void;
}

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined);

interface SchedulerProviderProps {
  children: ReactNode;
}

export function SchedulerProvider({ children }: SchedulerProviderProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, Record<Day, number[]>>>({});
  const [teacherAvailability, setTeacherAvailability] = useState<Record<string, number[]>>({});
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(4);
  const [maxClassesPerWeek, setMaxClassesPerWeek] = useState(16);
  const [requireBreakAfterClass, setRequireBreakAfterClass] = useState(true);

  const value = {
    selectedClass,
    conflicts,
    teacherAvailability,
    maxClassesPerDay,
    maxClassesPerWeek,
    requireBreakAfterClass,
    setSelectedClass,
    setConflicts,
    setTeacherAvailability,
    setMaxClassesPerDay,
    setMaxClassesPerWeek,
    setRequireBreakAfterClass,
  };

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  const context = useContext(SchedulerContext);
  if (context === undefined) {
    throw new Error('useScheduler must be used within a SchedulerProvider');
  }
  return context;
}