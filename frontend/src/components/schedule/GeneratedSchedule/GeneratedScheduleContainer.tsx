import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GeneratedSchedule from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Schedule, Conflict } from '../../../types/schedule.types';
import { Class } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ScheduleService } from '../../../services/scheduleService';
import { useDragDropSchedule } from '../../../hooks/useDragDropSchedule';
import { useSchedule } from '../../../hooks/useScheduleQuery';

interface GeneratedScheduleContainerProps {
  scheduleId?: string;
}

const GeneratedScheduleContainer: React.FC<GeneratedScheduleContainerProps> = ({ scheduleId }) => {
  const { handleQueryError } = useErrorHandler();
  const [isValidating, setIsValidating] = useState(false);

  // Fetch schedule data using the existing hook
  const { data: schedule, isLoading: isLoadingSchedule, isError: isErrorSchedule } = useSchedule(scheduleId!);

  // Add debug logging
  React.useEffect(() => {
    if (schedule) {
      console.log('[DEBUG] Schedule data received:', schedule);
    }
  }, [schedule]);

  // Fetch conflicts data
  const { data: conflicts, isLoading: isLoadingConflicts, isError: isErrorConflicts } = useQuery({
    queryKey: ['conflicts', scheduleId],
    queryFn: () => ScheduleService.getScheduleConflicts(scheduleId!),
    enabled: !!schedule, // Only fetch conflicts if schedule is loaded
    throwOnError: true
  });

  // Fetch classes data to get grade levels
  const { data: classes, isLoading: isLoadingClasses, isError: isErrorClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => ScheduleService.getAllClasses(),
    throwOnError: true
  });

  // Set up drag-and-drop functionality
  const { handleDragEnd } = useDragDropSchedule({
    scheduleId: scheduleId!,
    onValidationStart: () => {
      setIsValidating(true);
    },
    onValidationEnd: () => {
      setIsValidating(false);
    },
    onMoveSuccess: () => {
      // Could add a success notification here
    },
    onMoveError: (error) => handleQueryError(error)
  });

  const isLoading = isLoadingSchedule || isLoadingConflicts || isLoadingClasses;
  const isError = isErrorSchedule || isErrorConflicts || isErrorClasses;

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (isError || !schedule || !conflicts || !classes || !schedule.assignments?.length || !classes.length) {
    return <div>Error loading schedule data</div>;
  }

    if (!scheduleId) {
    return <div>No schedule selected.</div>;
  }

  // Create a map of class IDs to grade levels
  const classGrades = classes.reduce<Record<string, number>>((acc, cls) => {
    acc[cls.id] = cls.gradeLevel;
    return acc;
  }, {});

  return (
    <div className="relative">
      <GeneratedSchedule
        schedule={schedule}
        conflicts={conflicts}
        classGrades={classGrades}
        onDragEnd={handleDragEnd}
      />
      
      {/* Overlay for validation state */}
      {isValidating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-lg font-semibold text-gray-700">Validating move...</div>
            </div>
          </div>
        </div>
      )}
    </div>
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