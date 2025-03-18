import { ApiError, isApiError, getErrorConfig, formatErrorMessage } from './types';

/**
 * Generic error handler that processes different types of errors
 * and returns a standardized ApiError
 */
export const handleError = (error: unknown): ApiError => {
  // If it's already an ApiError, return it
  if (isApiError(error)) {
    return error;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message
    };
  }

  // Handle network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed'
    };
  }

  // Handle unknown error types
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred'
  };
};

/**
 * Handle schedule-specific errors
 */
export const handleScheduleError = (error: unknown): ApiError => {
  const apiError = handleError(error);
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Schedule Error:', {
      error: apiError,
      originalError: error
    });
  }

  return apiError;
};

/**
 * Handle errors during constraint validation
 */
export const handleConstraintError = (error: unknown): ApiError => {
  const apiError = handleError(error);
  
  // Convert generic errors to constraint-specific ones
  if (apiError.code === 'UNKNOWN_ERROR') {
    return {
      code: 'CONSTRAINT_VIOLATION',
      message: 'Invalid constraint configuration',
      details: {
        originalError: apiError
      }
    };
  }

  return apiError;
};

/**
 * Format and log errors for development debugging
 */
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const apiError = handleError(error);
  const config = getErrorConfig(apiError.code);
  
  console.group(`Error${context ? ` in ${context}` : ''}`);
  console.error('Error Details:', {
    error: apiError,
    config,
    userMessage: formatErrorMessage(apiError),
    timestamp: new Date().toISOString()
  });
  console.groupEnd();
};

/**
 * Create a retry function with exponential backoff
 */
export const createRetryFunction = <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): () => Promise<T> => {
  return async () => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const apiError = handleError(error);
        const config = getErrorConfig(apiError.code);
        
        // Don't retry if the error is marked as non-retryable
        if (!config.retryable) {
          throw apiError;
        }
        
        // Wait with exponential backoff before retrying
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw handleError(lastError);
  };
};

/**
 * Wrap a promise with error handling
 */
export const withErrorHandling = async <T>(
  promise: Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    logError(error, context);
    throw handleError(error);
  }
};