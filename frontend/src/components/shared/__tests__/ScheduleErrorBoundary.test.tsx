import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleErrorBoundary, withScheduleErrorBoundary } from '../ScheduleErrorBoundary';
import { ApiError } from '../../../utils/error/types';
import { vi } from 'vitest';

// Test component that can throw errors
const TestComponent: React.FC<{ throwError?: boolean; apiError?: boolean }> = ({
  throwError,
  apiError
}) => {
  if (throwError) {
    if (apiError) {
      throw {
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Test schedule error'
      } as ApiError;
    }
    throw new Error('Test error');
  }
  return <div>Test Component</div>;
};

describe('ScheduleErrorBoundary', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should render children when there is no error', () => {
    render(
      <ScheduleErrorBoundary>
        <TestComponent />
      </ScheduleErrorBoundary>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle standard errors', () => {
    render(
      <ScheduleErrorBoundary>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    expect(screen.getByText('Schedule Error')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('should handle API errors', () => {
    render(
      <ScheduleErrorBoundary>
        <TestComponent throwError apiError />
      </ScheduleErrorBoundary>
    );

    expect(screen.getByText('Schedule Error')).toBeInTheDocument();
    expect(screen.getByText(/Test schedule error/)).toBeInTheDocument();
  });

  it('should call onError prop when error occurs', () => {
    const onError = vi.fn();
    render(
      <ScheduleErrorBoundary onError={onError}>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('should show retry button when retryOnError is true', () => {
    render(
      <ScheduleErrorBoundary retryOnError>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should not show retry button when retryOnError is false', () => {
    render(
      <ScheduleErrorBoundary retryOnError={false}>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('should handle retry action', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ScheduleErrorBoundary retryOnError>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(mockReload).toHaveBeenCalled();
  });

  it('should log errors in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    render(
      <ScheduleErrorBoundary>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('should show technical details in an expandable section', () => {
    render(
      <ScheduleErrorBoundary>
        <TestComponent throwError />
      </ScheduleErrorBoundary>
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Technical Details'));
    expect(screen.getByText(/UNKNOWN_ERROR/)).toBeInTheDocument();
  });

  describe('withScheduleErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const WrappedComponent = withScheduleErrorBoundary(TestComponent);
      render(<WrappedComponent throwError />);

      expect(screen.getByText('Schedule Error')).toBeInTheDocument();
    });

    it('should pass through props to wrapped component', () => {
      const WrappedComponent = withScheduleErrorBoundary(TestComponent);
      render(<WrappedComponent />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('should accept error boundary props', () => {
      const onError = vi.fn();
      const WrappedComponent = withScheduleErrorBoundary(TestComponent, {
        onError,
        retryOnError: true
      });
      
      render(<WrappedComponent throwError />);

      expect(onError).toHaveBeenCalled();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});