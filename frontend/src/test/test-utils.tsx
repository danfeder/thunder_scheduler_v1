import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from '../context/error/ErrorContext';

// Create a fresh QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // Time to keep unused data in cache
      staleTime: 0, // Time until data is considered stale
      refetchOnWindowFocus: false,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Custom render function that wraps the component with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ErrorProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ErrorProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';
export { renderWithProviders as render };