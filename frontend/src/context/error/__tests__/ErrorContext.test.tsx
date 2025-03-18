import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorProvider, useError, ErrorAlert, ErrorBoundary } from '../ErrorContext';
import { ApiError } from '../../../utils/error/types';

// Test component that uses the error context
const TestComponent: React.FC<{ throwError?: boolean; customError?: ApiError }> = ({
  throwError,
  customError
}) => {
  const { setError, errorMessage, clearError } = useError();

  if (throwError) {
    throw new Error('Test error');
  }

  return (
    <div>
      <button onClick={() => setError(customError || new Error('Test error'))}>
        Trigger Error
      </button>
      <button onClick={clearError}>Clear Error</button>
      {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
    </div>
  );
};

describe('Error Context', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorProvider', () => {
    it('should provide error context to children', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      expect(screen.getByText('Trigger Error')).toBeInTheDocument();
    });

    it('should handle setting and clearing errors', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      // Trigger error
      fireEvent.click(screen.getByText('Trigger Error'));
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      // Clear error
      fireEvent.click(screen.getByText('Clear Error'));
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle API errors correctly', () => {
      const apiError: ApiError = {
        code: 'TEST_ERROR',
        message: 'API test error'
      };

      render(
        <ErrorProvider>
          <TestComponent customError={apiError} />
        </ErrorProvider>
      );

      fireEvent.click(screen.getByText('Trigger Error'));
      expect(screen.getByTestId('error-message')).toHaveTextContent('API test error');
    });
  });

  describe('ErrorBoundary', () => {
    it('should catch and handle errors', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <TestComponent throwError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should render custom fallback if provided', () => {
      const fallback = <div>Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={fallback}>
          <TestComponent throwError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('should allow retry functionality', () => {
      const { container } = render(
        <ErrorBoundary>
          <TestComponent throwError />
        </ErrorBoundary>
      );

      // Mock reload function
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      // Click retry button
      fireEvent.click(screen.getByText('Try again'));
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('ErrorAlert', () => {
    const testError: ApiError = {
      code: 'TEST_ERROR',
      message: 'Test alert error'
    };

    it('should render error message', () => {
      render(<ErrorAlert error={testError} />);
      expect(screen.getByRole('alert')).toHaveTextContent('Test alert error');
    });

    it('should handle close button click', () => {
      const onClose = jest.fn();
      render(<ErrorAlert error={testError} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close alert'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should show error severity', () => {
      render(<ErrorAlert error={testError} />);
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });
  });

  describe('useError hook', () => {
    it('should throw if used outside ErrorProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useError must be used within an ErrorProvider');

      consoleSpy.mockRestore();
    });

    it('should provide error handling methods', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      const triggerButton = screen.getByText('Trigger Error');
      const clearButton = screen.getByText('Clear Error');

      expect(triggerButton).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
    });
  });
});