import React from 'react';
import { ReactQueryDevtools as TanStackReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * React Query Devtools component that only renders in development mode
 * This component provides a UI for monitoring and debugging React Query
 */
export const ReactQueryDevtools: React.FC = () => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <TanStackReactQueryDevtools
      initialIsOpen={false}
      position="bottom-right"
    />
  );
};

export default ReactQueryDevtools;