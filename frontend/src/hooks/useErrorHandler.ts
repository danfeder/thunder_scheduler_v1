import { useCallback } from 'react';
import { useError } from '../context/error/ErrorContext';
import { ApiError, isApiError } from '../utils/error/types';
import { handleError as baseHandleError } from '../utils/error/handlers';

export const useErrorHandler = () => {
  const { handleError: contextHandleError } = useError();

  const handleQueryError = useCallback(
    (error: unknown, customHandler?: (error: ApiError) => void) => {
      // Convert to ApiError if it's not already
      const apiError = isApiError(error) ? error : baseHandleError(error);
      
      // Handle through context
      contextHandleError(apiError);
      
      // Call custom handler if provided
      if (customHandler) {
        customHandler(apiError);
      }
    },
    [contextHandleError]
  );

  return { handleQueryError };
};