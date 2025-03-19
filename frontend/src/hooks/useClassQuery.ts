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
import { Class, DailyConflicts } from '../types/class.types';
import { ApiError } from '../utils/error/types';

type ClassKey = readonly ['classes', string] | readonly ['classes'];

type ClassQueryOptions<TData> = Omit<
  UseQueryOptions<TData, ApiError, TData, ClassKey>,
  'queryKey' | 'queryFn'
>;

// Query key factory
const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all] as const,
  detail: (id: string) => [...classKeys.all, id] as const,
};

/**
 * Hook for fetching a class by ID
 */
export const useClass = (
  classId: string,
  options?: ClassQueryOptions<Class>
): UseQueryResult<Class, ApiError> => {
  const { handleQueryError } = useErrorHandler();

  return useQuery<Class, ApiError, Class, ClassKey>({
    queryKey: classKeys.detail(classId),
    queryFn: () => ScheduleService.getClass(classId),
    ...options,
    throwOnError: true,
    retry: 1,
    enabled: !!classId // Only run the query if classId is provided
  });
};

/**
 * Hook for fetching all classes
 */
export const useAllClasses = (
  options?: ClassQueryOptions<Class[]>
): UseQueryResult<Class[], ApiError> => {
  const { handleQueryError } = useErrorHandler();

  return useQuery<Class[], ApiError, Class[], ClassKey>({
    queryKey: classKeys.lists(),
    queryFn: async () => {
      console.log('[DEBUG] useAllClasses: Fetching classes...');
      try {
        const response = await ScheduleService.getAllClasses();
        console.log('[DEBUG] useAllClasses: Response:', response);
        
        // Check if response is valid
        if (!response) {
          console.error('[DEBUG] useAllClasses: No response received');
          throw new Error('No classes data received');
        }
        
        // Log the response structure to help debug
        console.log('[DEBUG] useAllClasses: Response type:', typeof response);
        console.log('[DEBUG] useAllClasses: Response keys:', Object.keys(response));
        console.log('[DEBUG] useAllClasses: Is array?', Array.isArray(response));
        
        // If response is empty array, return it
        if (Array.isArray(response) && response.length === 0) {
          console.log('[DEBUG] useAllClasses: Empty array received');
          return [];
        }
        
        // If response is not an array, throw error
        if (!Array.isArray(response)) {
          console.error('[DEBUG] useAllClasses: Response is not an array:', response);
          throw new Error('Invalid response format: expected array of classes');
        }
        
        return response;
      } catch (error) {
        console.error('[DEBUG] useAllClasses: Error fetching classes:', error);
        throw error;
      }
    },
    retry: 1,
    ...options,
    throwOnError: true
  });
};

/**
 * Hook for updating class conflicts
 */
export const useUpdateClassConflicts = (
  classId: string
): UseMutationResult<Class, ApiError, DailyConflicts[]> => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  return useMutation<Class, ApiError, DailyConflicts[]>({
    mutationFn: conflicts => ScheduleService.updateClassConflicts(classId, conflicts),
    onSuccess: updatedClass => {
      queryClient.setQueryData(classKeys.detail(classId), updatedClass);
    },
    onError: (error) => handleQueryError(error)
  });
};