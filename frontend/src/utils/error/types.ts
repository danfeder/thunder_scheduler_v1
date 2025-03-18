/**
 * Error types and utilities for Thunder Scheduler
 */

/**
 * Standard API error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Error codes and their user-friendly messages
 */
export const ERROR_CODES = {
  // Schedule-related errors
  SCHEDULE_NOT_FOUND: 'Schedule could not be found',
  CONSTRAINT_VIOLATION: 'The schedule violates one or more constraints',
  SOLVER_ERROR: 'Unable to generate schedule with current constraints',
  
  // Data validation errors
  VALIDATION_ERROR: 'Invalid input data provided',
  INVALID_DATE_RANGE: 'Invalid date range specified',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  
  // Network and system errors
  NETWORK_ERROR: 'Unable to connect to the server',
  SERVER_ERROR: 'An unexpected server error occurred',
  DATABASE_ERROR: 'Database operation failed',
  
  // User interaction errors
  UNAUTHORIZED: 'You are not authorized to perform this action',
  CONCURRENT_MODIFICATION: 'Schedule was modified by another user',
  
  // Fallback
  UNKNOWN_ERROR: 'An unexpected error occurred'
} as const;

/**
 * Type for error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Configuration for error handling
 */
export interface ErrorConfig {
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
  action?: string;
}

/**
 * Mapping of error codes to their configurations
 */
export const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  SCHEDULE_NOT_FOUND: {
    severity: 'error',
    retryable: false,
    userMessage: ERROR_CODES.SCHEDULE_NOT_FOUND,
    action: 'Please verify the schedule ID and try again'
  },
  CONSTRAINT_VIOLATION: {
    severity: 'warning',
    retryable: true,
    userMessage: ERROR_CODES.CONSTRAINT_VIOLATION,
    action: 'Review and adjust the constraints'
  },
  SOLVER_ERROR: {
    severity: 'error',
    retryable: true,
    userMessage: ERROR_CODES.SOLVER_ERROR,
    action: 'Try adjusting the constraints or contact support'
  },
  NETWORK_ERROR: {
    severity: 'error',
    retryable: true,
    userMessage: ERROR_CODES.NETWORK_ERROR,
    action: 'Check your internet connection and try again'
  },
  UNKNOWN_ERROR: {
    severity: 'error',
    retryable: false,
    userMessage: ERROR_CODES.UNKNOWN_ERROR,
    action: 'Please contact support if the issue persists'
  }
};

/**
 * Helper function to get error configuration
 */
export const getErrorConfig = (code: string): ErrorConfig => {
  return ERROR_CONFIGS[code] || ERROR_CONFIGS.UNKNOWN_ERROR;
};

/**
 * Function to format error message for display
 */
export const formatErrorMessage = (error: ApiError): string => {
  const config = getErrorConfig(error.code);
  return `${config.userMessage}${config.action ? `. ${config.action}` : ''}`;
};

/**
 * Type guard to check if an error is an ApiError
 */
export const isApiError = (error: any): error is ApiError => {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  );
};