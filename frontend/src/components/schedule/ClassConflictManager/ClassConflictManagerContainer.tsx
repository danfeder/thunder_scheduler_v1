import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ClassConflictManager from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Class, DailyConflicts } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ScheduleService } from '../../../services/scheduleService';
import usePerformanceMonitoring from '../../../hooks/usePerformanceMonitoring';

interface ClassConflictManagerContainerProps {
  classId: string;
}

const ClassConflictManagerContainer: React.FC<ClassConflictManagerContainerProps> = ({ classId }) => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();
  const { measureApiCall } = usePerformanceMonitoring('ClassConflictManagerContainer');

  // Fetch class data with performance monitoring
  const { data: classData, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => measureApiCall('getClass', () => ScheduleService.getClass(classId)),
    throwOnError: true,
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Log performance metrics when data is loaded
  useEffect(() => {
    if (classData && dataUpdatedAt) {
      const loadTime = performance.now() - dataUpdatedAt;
      console.log(`[Performance] ClassConflictManager data loaded in ${loadTime.toFixed(2)}ms`);
    }
  }, [classData, dataUpdatedAt]);

  // Update conflicts mutation with performance monitoring
  const updateConflictsMutation = useMutation({
    mutationFn: (conflicts: DailyConflicts[]) =>
      measureApiCall('updateClassConflicts', () =>
        ScheduleService.updateClassConflicts(classId, conflicts)
      ),
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
    const startTime = performance.now();
    updateConflictsMutation.mutate(conflicts, {
      onSuccess: () => {
        const endTime = performance.now();
        console.log(`[Performance] Conflicts updated in ${(endTime - startTime).toFixed(2)}ms`);
      }
    });
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