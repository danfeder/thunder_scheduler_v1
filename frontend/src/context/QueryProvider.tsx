import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactQueryDevtools from '../components/devtools/ReactQueryDevtools';

const queryClient = new QueryClient();

// Enable performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Log query cache events for debugging
  queryClient.getQueryCache().subscribe((event) => {
    console.log('[Query Cache Event]:', event.type);
  });
}

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};