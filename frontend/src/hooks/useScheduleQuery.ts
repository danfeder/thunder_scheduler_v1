import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
  UseQueryOptions
} from '@tanstack/react-query';
import { ScheduleService } from '../services/scheduleService';
import { get } from '../services/api';
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
    queryFn: async () => {
      console.log('[DEBUG] useSchedule: Fetching schedule by ID:', scheduleId);
      try {
        const response = await ScheduleService.getSchedule(scheduleId);
        console.log('[DEBUG] useSchedule: Raw response:', response);
        
        if (!response) {
          console.error('[DEBUG] useSchedule: No response received');
          return {} as Schedule;
        }
        
        if (!response.id) {
          console.error('[DEBUG] useSchedule: Invalid schedule format:', response);
          return {} as Schedule;
        }
        
        return response;
      } catch (error) {
        console.error('[DEBUG] useSchedule: Error fetching schedule:', error);
        return {} as Schedule;
      }
    },
    retry: 1,
    ...options,
    throwOnError: false
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
    queryFn: async () => {
      console.log('[DEBUG] useAllSchedules: Fetching schedules...');
      try {
        const response = await ScheduleService.getAllSchedules();
        console.log('[DEBUG] useAllSchedules: Response:', response);
        
        // Check if response is valid
        if (!response) {
          console.error('[DEBUG] useAllSchedules: No response received');
          throw new Error('No schedules data received');
        }
        
        // Log the response structure to help debug
        console.log('[DEBUG] useAllSchedules: Response type:', typeof response);
        console.log('[DEBUG] useAllSchedules: Response keys:', Object.keys(response));
        console.log('[DEBUG] useAllSchedules: Is array?', Array.isArray(response));
        
        // If response is empty array, return it
        if (Array.isArray(response) && response.length === 0) {
          console.log('[DEBUG] useAllSchedules: Empty array received');
          return [];
        }
        
        // If response is not an array, throw error
        if (!Array.isArray(response)) {
          console.error('[DEBUG] useAllSchedules: Response is not an array:', response);
          throw new Error('Invalid response format: expected array of schedules');
        }
        
        return response;
      } catch (error) {
        console.error('[DEBUG] useAllSchedules: Error fetching schedules:', error);
        throw error;
      }
    },
    retry: 1,
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
      return response;
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
      return response;
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
      return response;
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