import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ClassConflictManager from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Class, DailyConflicts } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ScheduleService } from '../../../services/scheduleService';

interface ClassConflictManagerContainerProps {
  classId: string;
}

const ClassConflictManagerContainer: React.FC<ClassConflictManagerContainerProps> = ({ classId }) => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  // Fetch class data
  const { data: classData, isLoading, isError } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => ScheduleService.getClass(classId),
    throwOnError: true
  });

  // Update conflicts mutation
  const updateConflictsMutation = useMutation({
    mutationFn: (conflicts: DailyConflicts[]) => ScheduleService.updateClassConflicts(classId, conflicts),
    onMutate: async (newConflicts) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['class', classId] });
      
      // Snapshot the previous value
      const previousClass = queryClient.getQueryData<Class>(['class', classId]);
      
      // Optimistically update to the new value
      if (previousClass) {
        queryClient.setQueryData(['class', classId], {
          ...previousClass,
          conflicts: newConflicts
        });
      }
      
      return { previousClass };
    },
    onError: (err, newConflicts, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousClass) {
        queryClient.setQueryData(['class', classId], context.previousClass);
      }
      handleQueryError(err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
    }
  });

  // Handle conflicts change
  const handleConflictsChange = (conflicts: DailyConflicts[]) => {
    updateConflictsMutation.mutate(conflicts);
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (isError || !classData) {
    return <div>Error loading class data</div>;
  }

  return (
    <ClassConflictManager
      classId={classId}
      initialConflicts={classData.conflicts}
      onConflictsChange={handleConflictsChange}
    />
  );
};

export const ClassConflictManagerWithErrorBoundary: React.FC<ClassConflictManagerContainerProps> = (props) => {
  return (
    <ScheduleErrorBoundary retryOnError>
      <ClassConflictManagerContainer {...props} />
    </ScheduleErrorBoundary>
  );
};

export default ClassConflictManagerWithErrorBoundary;