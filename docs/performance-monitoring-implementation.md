# Thunder Scheduler: Performance Monitoring Implementation

This document outlines the performance monitoring implementation for the Thunder Scheduler project, focusing on measuring and optimizing the performance of the frontend components and API interactions.

## Overview

The performance monitoring system consists of several components:

1. **Performance Monitoring Utilities**: Core utilities for measuring and tracking performance metrics
2. **React Hook Integration**: Custom hooks for monitoring component performance
3. **React Query Integration**: Enhanced React Query configuration for monitoring API performance
4. **Performance Visualization**: UI components for displaying performance metrics
5. **Real API Testing**: Tests that measure performance with real backend APIs

## Performance Monitoring Utilities

The core performance monitoring utilities are located in `frontend/src/utils/performance/performanceMonitor.ts`. These utilities provide:

- Measurement of component render times
- Measurement of API call times
- Collection and aggregation of performance metrics
- Generation of performance reports

```typescript
// Example usage
import { startMeasuringRender, measureApiCall } from '../utils/performance/performanceMonitor';

// Measure component render time
const endMeasuring = startMeasuringRender('MyComponent');
// ... component renders ...
const metrics = endMeasuring(); // Records render time

// Measure API call time
const data = await measureApiCall('fetchData', () => api.fetchData());
```

## React Hook Integration

The `usePerformanceMonitoring` hook in `frontend/src/hooks/usePerformanceMonitoring.ts` provides a convenient way to monitor component performance:

```typescript
import usePerformanceMonitoring from '../hooks/usePerformanceMonitoring';

const MyComponent = () => {
  const { measureApiCall } = usePerformanceMonitoring('MyComponent');
  
  // Use the hook to measure API calls
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: () => measureApiCall('fetchData', () => api.fetchData())
  });
  
  return <div>...</div>;
};
```

## React Query Integration

The React Query configuration in `frontend/src/context/QueryProvider.tsx` has been enhanced to:

- Log query events for performance tracking
- Configure optimal caching strategies
- Provide debugging information in development mode

Additionally, React Query Devtools have been added to help visualize query performance in development mode.

## Performance Visualization

The `PerformanceMonitor` component in `frontend/src/components/devtools/PerformanceMonitor.tsx` provides a UI for visualizing performance metrics:

- Toggle button to show/hide performance metrics
- Summary view of average metrics by component
- Detailed view of all collected metrics
- Automatic updates on a configurable interval

This component is only visible in development mode by default but can be enabled in production if needed.

## Real API Testing

Real API tests in `frontend/src/test/real-api/` measure the performance of components when interacting with the actual backend API:

- Tests for loading performance
- Tests for update performance
- Tests for error handling performance
- Tests for concurrent operations

These tests can be run using the `test-with-real-api.sh` script, which:

1. Starts the backend server
2. Runs the real API tests
3. Reports performance metrics

## Performance Optimization Strategies

Based on the performance monitoring, several optimization strategies have been implemented:

1. **Optimized Query Configuration**:
   - Appropriate stale times for different types of data
   - Optimistic updates for mutations
   - Selective refetching

2. **Component Optimizations**:
   - Memoization of expensive calculations
   - Lazy loading of components
   - Efficient re-rendering strategies

3. **Network Optimizations**:
   - Batched API requests
   - Minimized payload sizes
   - Proper error handling and retries

## Usage Guidelines

### Adding Performance Monitoring to a Component

```typescript
import usePerformanceMonitoring from '../hooks/usePerformanceMonitoring';

const MyComponent = ({ id }) => {
  const { measureApiCall } = usePerformanceMonitoring('MyComponent');
  
  const { data, isLoading } = useQuery({
    queryKey: ['data', id],
    queryFn: () => measureApiCall('getData', () => api.getData(id))
  });
  
  // Rest of component...
};
```

### Viewing Performance Metrics

In development mode, the Performance Monitor button appears in the bottom right corner of the application. Click it to view:

- Average render times by component
- API call times
- Total load times
- Raw performance data

### Running Performance Tests

```bash
# Run all real API tests with performance monitoring
./test-with-real-api.sh

# Run specific performance tests
cd frontend
npm test -- -t "Real API" -t "ClassConflictManager"
```

## Future Enhancements

1. **Server-Side Metrics**: Collect and correlate backend performance metrics
2. **Performance Budgets**: Set thresholds for acceptable performance
3. **Automated Performance Regression Testing**: CI/CD integration for performance testing
4. **User-Centric Metrics**: Measure perceived performance from the user's perspective
5. **Performance Optimization Suggestions**: Automated suggestions for improving performance