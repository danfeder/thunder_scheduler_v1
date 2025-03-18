import { handleError, handleScheduleError, handleConstraintError, createRetryFunction } from '../handlers';
import { ApiError } from '../types';

describe('Error Handlers', () => {
  describe('handleError', () => {
    it('should handle ApiError correctly', () => {
      const apiError: ApiError = {
        code: 'TEST_ERROR',
        message: 'Test error message'
      };
      
      const result = handleError(apiError);
      expect(result).toEqual(apiError);
    });

    it('should handle standard Error objects', () => {
      const error = new Error('Standard error');
      const result = handleError(error);
      
      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Standard error'
      });
    });

    it('should handle network errors', () => {
      const networkError = new TypeError('Failed to fetch');
      const result = handleError(networkError);
      
      expect(result).toEqual({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed'
      });
    });

    it('should handle unknown error types', () => {
      const result = handleError('unexpected error');
      
      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
      });
    });
  });

  describe('handleScheduleError', () => {
    const originalConsoleError = console.error;
    beforeEach(() => {
      console.error = jest.fn();
    });
    
    afterEach(() => {
      console.error = originalConsoleError;
    });

    it('should process schedule-specific errors', () => {
      const error: ApiError = {
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Schedule not found'
      };
      
      const result = handleScheduleError(error);
      expect(result).toEqual(error);
    });

    it('should log errors in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      handleScheduleError(error);
      
      expect(console.error).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('handleConstraintError', () => {
    it('should convert unknown errors to constraint violations', () => {
      const error = new Error('Unknown error');
      const result = handleConstraintError(error);
      
      expect(result).toEqual({
        code: 'CONSTRAINT_VIOLATION',
        message: 'Invalid constraint configuration',
        details: {
          originalError: {
            code: 'UNKNOWN_ERROR',
            message: 'Unknown error'
          }
        }
      });
    });

    it('should pass through known constraint errors', () => {
      const constraintError: ApiError = {
        code: 'CONSTRAINT_VIOLATION',
        message: 'Specific constraint error'
      };
      
      const result = handleConstraintError(constraintError);
      expect(result).toEqual(constraintError);
    });
  });

  describe('createRetryFunction', () => {
    it('should retry failed operations', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const retryFn = createRetryFunction(mockFn, 3, 100);
      const result = await retryFn();

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError: ApiError = {
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Schedule not found'
      };

      const mockFn = jest.fn().mockRejectedValue(nonRetryableError);
      const retryFn = createRetryFunction(mockFn, 3, 100);

      await expect(retryFn()).rejects.toEqual(nonRetryableError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should give up after max retries', async () => {
      const error = new Error('Persistent error');
      const mockFn = jest.fn().mockRejectedValue(error);

      const retryFn = createRetryFunction(mockFn, 3, 100);
      await expect(retryFn()).rejects.toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Persistent error'
      });

      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });
});