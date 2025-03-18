import { useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';
import { Assignment, Schedule, Conflict } from '../types/schedule.types';
import { useUpdateAssignment, useValidateChanges } from './useScheduleQuery';
import { useErrorHandler } from './useErrorHandler';
import { ApiError } from '../utils/error/types';

interface ValidationResponse {
  valid: boolean;
  conflicts: string[];
}

interface UseDragDropScheduleProps {
  scheduleId: string;
  onValidationStart?: () => void;
  onValidationEnd?: () => void;
  onMoveSuccess?: () => void;
  onMoveError?: (error: Error) => void;
}

interface DragDropState {
  isValidating: boolean;
  lastValidMove: Assignment | null;
}

export const useDragDropSchedule = ({
  scheduleId,
  onValidationStart,
  onValidationEnd,
  onMoveSuccess,
  onMoveError
}: UseDragDropScheduleProps) => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();
  const updateAssignment = useUpdateAssignment(scheduleId);
  const validateChanges = useValidateChanges(scheduleId);

  const parseDropId = (dropId: string): { day: string; period: number } => {
    const [day, period] = dropId.split('-');
    return { day, period: parseInt(period, 10) };
  };

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId: classId } = result;

    // Drop outside valid target or no movement
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    const { day: sourceDayStr, period: sourcePeriod } = parseDropId(source.droppableId);
    const { day: destDayStr, period: destPeriod } = parseDropId(destination.droppableId);

    // Create new assignment
    const newAssignment: Assignment = {
      classId,
      day: destDayStr as Assignment['day'],
      period: destPeriod,
      week: 1 // TODO: Get current week from context/props
    };

    try {
      onValidationStart?.();

      // Validate the move
      const validationResponse = await validateChanges.mutateAsync({
        assignments: [newAssignment]
      });

      onValidationEnd?.();

      const conflicts = validationResponse.conflicts || [];
      if (conflicts.length > 0) {
        // Handle validation conflicts
        const conflictMessages = conflicts.join(', ');
        throw new Error(`Invalid move: ${conflictMessages}`);
      }

      // Optimistically update the UI
      queryClient.setQueryData<Schedule>(
        ['schedule', scheduleId],
        (oldData) => {
          if (!oldData) return oldData;

          const newAssignments = oldData.assignments.map(a =>
            a.classId === classId ? newAssignment : a
          );

          return {
            ...oldData,
            assignments: newAssignments
          };
        }
      );

      // Persist the change
      await updateAssignment.mutateAsync(newAssignment);
      onMoveSuccess?.();

    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({
        queryKey: ['schedule', scheduleId]
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to move class';
      handleQueryError(new Error(errorMessage));
      onMoveError?.(new Error(errorMessage));
    }
  }, [
    scheduleId,
    queryClient,
    validateChanges,
    updateAssignment,
    handleQueryError,
    onValidationStart,
    onValidationEnd,
    onMoveSuccess,
    onMoveError
  ]);

  return {
    handleDragEnd
  };
};

export default useDragDropSchedule;