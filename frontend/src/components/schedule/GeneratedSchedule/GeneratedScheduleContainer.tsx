import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GeneratedSchedule from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Schedule, Conflict } from '../../../types/schedule.types';
import { Class } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface GeneratedScheduleContainerProps {
  scheduleId: string;
}

// Mock services for now - will be replaced with actual services later
const ScheduleService = {
  getSchedule: async (id: string): Promise<Schedule> => {
    // This is a mock implementation
    return {
      id,
      startDate: '2025-01-06',
      endDate: '2025-01-31',
      rotationWeeks: 3,
      assignments: [
        {
          classId: 'class1',
          day: 'Monday',
          period: 1,
          week: 1
        },
        {
          classId: 'class2',
          day: 'Tuesday',
          period: 2,
          week: 1
        },
        {
          classId: 'class3',
          day: 'Wednesday',
          period: 3,
          week: 2
        }
      ],
      periods: [
        { id: 1, startTime: '', endTime: '' },
        { id: 2, startTime: '', endTime: '' },
        { id: 3, startTime: '', endTime: '' },
        { id: 4, startTime: '', endTime: '' },
        { id: 5, startTime: '', endTime: '' },
        { id: 6, startTime: '', endTime: '' },
        { id: 7, startTime: '', endTime: '' },
        { id: 8, startTime: '', endTime: '' }
      ]
    };
  },
  
  getConflicts: async (scheduleId: string): Promise<Conflict[]> => {
    // This is a mock implementation
    return [
      {
        classId: 'class1',
        day: 'Monday',
        period: 3,
        type: 'class',
        message: 'Conflict with another class'
      }
    ];
  },
  
  getClasses: async (): Promise<Class[]> => {
    // This is a mock implementation
    return [
      {
        id: 'class1',
        name: 'Class 1',
        gradeLevel: 1,
        conflicts: []
      },
      {
        id: 'class2',
        name: 'Class 2',
        gradeLevel: 2,
        conflicts: []
      },
      {
        id: 'class3',
        name: 'Class 3',
        gradeLevel: 3,
        conflicts: []
      }
    ];
  }
};

const GeneratedScheduleContainer: React.FC<GeneratedScheduleContainerProps> = ({ scheduleId }) => {
  const { handleQueryError } = useErrorHandler();

  // Fetch schedule data
  const { data: schedule, isLoading: isLoadingSchedule, isError: isErrorSchedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => ScheduleService.getSchedule(scheduleId),
    throwOnError: true
  });

  // Fetch conflicts data
  const { data: conflicts, isLoading: isLoadingConflicts, isError: isErrorConflicts } = useQuery({
    queryKey: ['conflicts', scheduleId],
    queryFn: () => ScheduleService.getConflicts(scheduleId),
    enabled: !!schedule, // Only fetch conflicts if schedule is loaded
    throwOnError: true
  });

  // Fetch classes data to get grade levels
  const { data: classes, isLoading: isLoadingClasses, isError: isErrorClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => ScheduleService.getClasses(),
    throwOnError: true
  });

  const isLoading = isLoadingSchedule || isLoadingConflicts || isLoadingClasses;
  const isError = isErrorSchedule || isErrorConflicts || isErrorClasses;

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (isError || !schedule || !conflicts || !classes) {
    return <div>Error loading schedule data</div>;
  }

  // Create a map of class IDs to grade levels
  const classGrades = classes.reduce<Record<string, number>>((acc, cls) => {
    acc[cls.id] = cls.gradeLevel;
    return acc;
  }, {});

  return (
    <GeneratedSchedule
      schedule={schedule}
      conflicts={conflicts}
      classGrades={classGrades}
    />
  );
};

export const GeneratedScheduleWithErrorBoundary: React.FC<GeneratedScheduleContainerProps> = (props) => {
  return (
    <ScheduleErrorBoundary retryOnError>
      <GeneratedScheduleContainer {...props} />
    </ScheduleErrorBoundary>
  );
};

export default GeneratedScheduleWithErrorBoundary;