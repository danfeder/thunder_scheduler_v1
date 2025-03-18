import { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '../test-utils';
import { ReactElement } from 'react';

/**
 * Creates a QueryClient configured for real API testing
 * with longer timeouts and real network requests
 */
export const createRealApiQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 10000, // 10 seconds
      gcTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Renders a component with providers configured for real API testing
 */
export function renderForRealApiTesting(
  ui: ReactElement,
  options: { queryClient?: QueryClient } = {}
) {
  return renderWithProviders(ui, {
    queryClient: options.queryClient || createRealApiQueryClient(),
    ...options,
  });
}

/**
 * Helper function to wait for network requests to complete
 * Useful for real API testing where we need to wait for actual network responses
 */
export const waitForNetworkIdle = (timeout = 1000): Promise<void> => {
  return new Promise((resolve) => {
    // Give network requests some time to complete
    setTimeout(resolve, timeout);
  });
};

/**
 * Helper function to check if the backend is running
 * @returns Promise that resolves to true if backend is running, false otherwise
 */
export const isBackendRunning = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
};