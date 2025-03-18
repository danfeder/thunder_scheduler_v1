import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { useError } from '../../context/error/ErrorContext';
import { ApiError } from '../../utils/error/types';
import { vi, Mock } from 'vitest';

// Mock the useError hook
vi.mock('../../context/error/ErrorContext', () => ({
  useError: vi.fn()
}));

describe('useErrorHandler', () => {
  const mockHandleError = vi.fn();
  const mockCustomHandler = vi.fn();

  beforeEach(() => {
    (useError as Mock).mockReturnValue({
      handleError: mockHandleError
    });
    vi.clearAllMocks();
  });

  it('should handle API errors correctly', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError: ApiError = {
      code: 'TEST_ERROR',
      message: 'Test error message'
    };

    result.current.handleQueryError(apiError, mockCustomHandler);

    expect(mockHandleError).toHaveBeenCalledWith(apiError);
    expect(mockCustomHandler).toHaveBeenCalledWith(apiError);
  });

  it('should convert standard errors to API errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Standard error');

    result.current.handleQueryError(error, mockCustomHandler);

    expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'UNKNOWN_ERROR',
      message: 'Standard error'
    }));
    expect(mockCustomHandler).toHaveBeenCalledWith(expect.objectContaining({
      code: 'UNKNOWN_ERROR',
      message: 'Standard error'
    }));
  });

  it('should handle network errors specially', () => {
    const { result } = renderHook(() => useErrorHandler());
    const networkError = new TypeError('Failed to fetch');

    result.current.handleQueryError(networkError, mockCustomHandler);

    expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
      code: 'NETWORK_ERROR',
      message: 'Network connection failed'
    }));
    expect(mockCustomHandler).toHaveBeenCalledWith(expect.objectContaining({
      code: 'NETWORK_ERROR',
      message: 'Network connection failed'
    }));
  });

  it('should work without a custom handler', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError: ApiError = {
      code: 'TEST_ERROR',
      message: 'Test error message'
    };

    result.current.handleQueryError(apiError);

    expect(mockHandleError).toHaveBeenCalledWith(apiError);
    expect(mockCustomHandler).not.toHaveBeenCalled();
  });
});