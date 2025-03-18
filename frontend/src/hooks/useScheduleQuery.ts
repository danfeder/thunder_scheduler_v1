import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
  UseQueryOptions
} from '@tanstack/react-query';
import { ScheduleService } from '../services/scheduleService';
import { useErrorHandler } from './useErrorHandler';
import { Schedule, Assignment } from '../types/schedule.types';
import { ApiError } from '../utils/error/types';
import { APIResponse } from '../types/class.types';

interface GenerateScheduleParams {
  startDate: string;
  endDate: string;
  rotationWeeks: number;
}

interface MutationContext {
  previousSchedule?: Schedule;
}

interface ValidationResponse {
  valid: boolean;
  conflicts: string[];
}

type ScheduleKey = readonly ['schedules', string] | readonly ['schedules'];

type ScheduleQueryOptions<TData> = Omit<
  UseQueryOptions<TData, ApiError, TData, ScheduleKey>,
  'queryKey' | 'queryFn'
>;

// Query key factory
const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all] as const,
  detail: (id: string) => [...scheduleKeys.all, id] as const,
};

/**
 * Hook for fetching a schedule by ID
 */
export const useSchedule = (
  scheduleId: string,
  options?: ScheduleQueryOptions<Schedule>
): UseQueryResult<Schedule, ApiError> => {
  const { handleQueryError } = useErrorHandler();

  return useQuery<Schedule, ApiError, Schedule, ScheduleKey>({
    queryKey: scheduleKeys.detail(scheduleId),
    queryFn: () => ScheduleService.getSchedule(scheduleId),
    ...options,
    throwOnError: true
  });
};

/**
 * Hook for fetching all schedules
 */
export const useAllSchedules = (
  options?: ScheduleQueryOptions<Schedule[]>
): UseQueryResult<Schedule[], ApiError> => {
  const { handleQueryError } = useErrorHandler();

  return useQuery<Schedule[], ApiError, Schedule[], ScheduleKey>({
    queryKey: scheduleKeys.lists(),
    queryFn: () => ScheduleService.getAllSchedules(),
    ...options,
    throwOnError: true
  });
};

/**
 * Hook for updating a schedule
 */
export const useUpdateSchedule = (
  scheduleId: string
): UseMutationResult<Schedule, ApiError, Partial<Schedule>> => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  return useMutation<Schedule, ApiError, Partial<Schedule>>({
    mutationFn: updates => ScheduleService.updateSchedule(scheduleId, updates),
    onSuccess: updatedSchedule => {
      queryClient.setQueryData(scheduleKeys.detail(scheduleId), updatedSchedule);
    },
    onError: (error) => handleQueryError(error)
  });
};

/**
 * Hook for generating a new schedule
 */
export const useGenerateSchedule = (): UseMutationResult<
  Schedule,
  ApiError,
  GenerateScheduleParams
> => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  return useMutation<Schedule, ApiError, GenerateScheduleParams>({
    mutationFn: params => ScheduleService.generateSchedule(params),
    onSuccess: newSchedule => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.setQueryData(scheduleKeys.detail(newSchedule.id), newSchedule);
    },
    onError: (error) => handleQueryError(error)
  });
};

/**
 * Hook for updating an assignment within a schedule
 */
export const useUpdateAssignment = (
  scheduleId: string
): UseMutationResult<Schedule, ApiError, Assignment> => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  return useMutation<Schedule, ApiError, Assignment>({
    mutationFn: async assignment => {
      const response = await ScheduleService.updateAssignment(scheduleId, assignment);
      return response.data;
    },
    onSuccess: schedule => {
      queryClient.setQueryData(scheduleKeys.detail(scheduleId), schedule);
    },
    onError: (error) => handleQueryError(error)
  });
};

/**
 * Hook for validating schedule changes
 */
export const useValidateChanges = (
  scheduleId: string
): UseMutationResult<ValidationResponse, ApiError, Partial<Schedule>> => {
  const { handleQueryError } = useErrorHandler();

  return useMutation<ValidationResponse, ApiError, Partial<Schedule>>({
    mutationFn: async changes => {
      const response = await ScheduleService.validateChanges(scheduleId, changes);
      return response.data;
    },
    onError: (error) => handleQueryError(error)
  });
};

/**
 * Hook for resolving schedule conflicts
 */
export const useResolveConflicts = (
  scheduleId: string
): UseMutationResult<Schedule, ApiError, void> => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  return useMutation<Schedule, ApiError, void>({
    mutationFn: async () => {
      const response = await ScheduleService.resolveConflicts(scheduleId);
      return response.data;
    },
    onSuccess: schedule => {
      queryClient.setQueryData(scheduleKeys.detail(scheduleId), schedule);
    },
    onError: (error) => handleQueryError(error)
  });
};

/**
 * Hook for optimistic updates with rollback
 */
export const useOptimisticUpdate = (
  scheduleId: string
): UseMutationResult<Schedule, ApiError, Partial<Schedule>, MutationContext> => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  return useMutation<Schedule, ApiError, Partial<Schedule>, MutationContext>({
    mutationFn: updates => ScheduleService.updateSchedule(scheduleId, updates),
    onMutate: async updates => {
      await queryClient.cancelQueries({ queryKey: scheduleKeys.detail(scheduleId) });

      const previousSchedule = queryClient.getQueryData<Schedule>(
        scheduleKeys.detail(scheduleId)
      );

      if (previousSchedule) {
        queryClient.setQueryData(
          scheduleKeys.detail(scheduleId),
          { ...previousSchedule, ...updates }
        );
      }

      return { previousSchedule };
    },
    onError: (error, _variables, context) => {
      if (context?.previousSchedule) {
        queryClient.setQueryData(
          scheduleKeys.detail(scheduleId),
          context.previousSchedule
        );
      }
      handleQueryError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(scheduleId) });
    }
  });
};