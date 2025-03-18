import React, { createContext, useContext, useState, useCallback } from 'react';
import { ApiError, getErrorConfig, formatErrorMessage } from '../../utils/error/types';
import { handleError } from '../../utils/error/handlers';

interface ErrorContextState {
  error: ApiError | null;
  isError: boolean;
  errorMessage: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

const ErrorContext = createContext<ErrorContextState | undefined>(undefined);

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setErrorState] = useState<ApiError | null>(null);

  const setError = useCallback((err: unknown) => {
    const processedError = handleError(err);
    setErrorState(processedError);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Handle error and optionally perform additional actions
  const handleErrorWithContext = useCallback((err: unknown) => {
    const processedError = handleError(err);
    const config = getErrorConfig(processedError.code);

    // Set the error state
    setErrorState(processedError);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled by context:', {
        error: processedError,
        config,
        timestamp: new Date().toISOString()
      });
    }

    // Return the processed error for additional handling if needed
    return processedError;
  }, []);

  const value = {
    error,
    isError: error !== null,
    errorMessage: error ? formatErrorMessage(error) : null,
    setError,
    clearError,
    handleError: handleErrorWithContext
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

// Custom hook to use the error context
export const useError = (): ErrorContextState => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Error boundary component
interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', {
        error,
        errorInfo,
        timestamp: new Date().toISOString()
      });
    }

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.error) {
      // Use provided fallback or default error UI
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error.toString()}</pre>
          </details>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a styled error alert component
interface ErrorAlertProps {
  error: ApiError;
  onClose?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  const config = getErrorConfig(error.code);
  const message = formatErrorMessage(error);

  return (
    <div
      className={`error-alert ${config.severity} fixed top-4 right-4 p-4 rounded shadow-lg`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-bold mr-2">{config.severity.toUpperCase()}:</span>
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700"
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
      {config.action && (
        <div className="mt-2 text-sm text-gray-600">{config.action}</div>
      )}
    </div>
  );
};

export default ErrorContext;