import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GeneratedSchedule from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Schedule, Conflict } from '../../../types/schedule.types';
import { Class } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ScheduleService } from '../../../services/scheduleService';
import { useSchedule } from '../../../hooks/useScheduleQuery';

interface GeneratedScheduleContainerProps {
  scheduleId: string;
}

const GeneratedScheduleContainer: React.FC<GeneratedScheduleContainerProps> = ({ scheduleId }) => {
  const { handleQueryError } = useErrorHandler();

  // Fetch schedule data using the existing hook
  const { data: schedule, isLoading: isLoadingSchedule, isError: isErrorSchedule } = useSchedule(scheduleId);

  // Fetch conflicts data
  const { data: conflicts, isLoading: isLoadingConflicts, isError: isErrorConflicts } = useQuery({
    queryKey: ['conflicts', scheduleId],
    queryFn: () => ScheduleService.getScheduleConflicts(scheduleId),
    enabled: !!schedule, // Only fetch conflicts if schedule is loaded
    throwOnError: true
  });

  // Fetch classes data to get grade levels
  const { data: classes, isLoading: isLoadingClasses, isError: isErrorClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => ScheduleService.getAllClasses(),
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