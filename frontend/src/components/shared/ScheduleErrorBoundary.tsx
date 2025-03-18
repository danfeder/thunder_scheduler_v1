import React from 'react';
import { ErrorBoundary } from '../../context/error/ErrorContext';
import { ApiError, isApiError, formatErrorMessage } from '../../utils/error/types';
import { handleScheduleError } from '../../utils/error/handlers';

interface ScheduleErrorBoundaryState {
  error: Error | ApiError | null;
}

interface ScheduleErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error | ApiError) => void;
  retryOnError?: boolean;
}

/**
 * Specialized error boundary for schedule-related components
 * Handles schedule-specific errors and provides appropriate UI feedback
 */
export class ScheduleErrorBoundary extends React.Component<
  ScheduleErrorBoundaryProps,
  ScheduleErrorBoundaryState
> {
  constructor(props: ScheduleErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error | ApiError): ScheduleErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error | ApiError, errorInfo: React.ErrorInfo): void {
    const processedError = isApiError(error) ? error : handleScheduleError(error);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Schedule Error:', {
        error: processedError,
        errorInfo,
        timestamp: new Date().toISOString()
      });
    }

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(processedError);
    }
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const error = isApiError(this.state.error)
        ? this.state.error
        : handleScheduleError(this.state.error);

      return (
        <div className="schedule-error-boundary p-4 border rounded-lg bg-red-50 text-red-900">
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            
            <h3 className="text-lg font-semibold">Schedule Error</h3>
            
            <p className="text-center max-w-md">
              {formatErrorMessage(error)}
            </p>

            {this.props.retryOnError && (
              <button
                onClick={this.handleRetry}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            )}

            <details className="mt-4 text-sm">
              <summary className="cursor-pointer hover:text-red-700">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with ScheduleErrorBoundary
 */
export const withScheduleErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps?: Omit<ScheduleErrorBoundaryProps, 'children'>
) => {
  return function WithScheduleErrorBoundary(props: P) {
    return (
      <ScheduleErrorBoundary {...boundaryProps}>
        <WrappedComponent {...props} />
      </ScheduleErrorBoundary>
    );
  };
};

export default ScheduleErrorBoundary;