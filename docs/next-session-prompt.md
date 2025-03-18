# Thunder Scheduler: Initial Integration Phase - Real API Testing

## Project Context
I'm working on the Thunder Scheduler project, a cooking class scheduler application that helps organize classes for 33 elementary school classes around existing schedule constraints. The project uses a constraint satisfaction approach with Google OR-Tools.

## Current Progress
We've completed several phases of the project:
- Project setup with Node.js/Express backend and React frontend
- PostgreSQL database with Prisma ORM
- Basic project structure and API endpoints
- Docker configuration for local development
- OR-Tools integration with Python solver
- Basic Constraint Model with comprehensive testing
- CSV Import/Export functionality with validation
- Basic UI implementation with core components, state management, and API integration
- Schedule Visualization with specialized components for different use cases
- Error handling infrastructure and React Query integration
- MSW setup for API mocking in tests
- Container components with real API implementations for all visualization components
- Integration tests with mock services for all components
- Migration from Jest to Vitest for better MSW v2 compatibility
- Integration tests updated to work with MSW v2

All code is in the GitHub repository: https://github.com/danfeder/thunder_scheduler_v1
We're currently on the `feature/initial-integration` branch.

## Next Task: Test with Real Backend APIs and Implement Performance Monitoring
According to our updated progress tracker (docs/progress-tracker.md), we've made significant progress on Phase 1, Step 8: Initial Integration. We've successfully migrated from Jest to Vitest for better MSW v2 compatibility and updated our integration tests. Now we need to:
- Test the container components with real backend APIs
- Add tests for edge cases and error scenarios
- Implement performance monitoring
- Prepare for Phase 2: Enhanced UI and Manual Adjustments

## Key Documentation
Please refer to these files for detailed context:
- docs/project-brief.md: Contains the full project requirements
- docs/implementation-plan.md: Details the technical approach and architecture
- docs/progress-tracker.md: Shows what's been completed and what's next
- docs/initial-integration-plan.md: Detailed plan for the integration phase with progress tracking
- docs/component-api-integration-plan.md: Detailed implementation plan for API integration
- docs/jest-to-vitest-migration-plan.md: Details of the testing framework migration
- frontend/src/App.tsx: Main React application entry point
- frontend/src/components/schedule/: Directory containing all schedule visualization components
- frontend/src/components/schedule/examples/ScheduleExample.tsx: Example component showing proper API integration
- frontend/src/context/ScheduleContext.tsx: Global state management for schedules
- frontend/src/context/error/ErrorContext.tsx: Error handling context provider
- frontend/src/context/QueryProvider.tsx: React Query configuration
- frontend/src/hooks/useScheduleQuery.ts: Schedule-specific query hooks
- frontend/src/hooks/useErrorHandler.ts: Error handling hooks
- frontend/src/utils/error/: Error handling utilities
- frontend/src/services/scheduleService.ts: Service for schedule-related API operations
- frontend/src/test/: Testing infrastructure including MSW setup, fixtures, and utilities

## Technical Requirements
The Real API Testing implementation needs to handle:

1. API Integration Testing:
   - Test container components with real backend APIs
   - Verify data fetching and submission
   - Test error handling with real API responses
   - Validate type safety between frontend and backend

2. Performance Monitoring:
   - Implement performance metrics
   - Add load time monitoring
   - Optimize caching strategies
   - Test with larger datasets

3. Edge Case Testing:
   - Test network failures
   - Test invalid data responses
   - Test concurrent operations
   - Test with boundary conditions

## Current Implementation
We've successfully implemented:
- Three distinct schedule visualization components:
  - ClassConflictManager: Simple grid for toggling class conflicts
  - InstructorAvailability: Date-based calendar for teacher scheduling
  - GeneratedSchedule: Complex calendar for displaying the final schedule
- Container components for all visualization components with real API implementations:
  - ClassConflictManagerContainer: Connected to class and conflict endpoints
  - InstructorAvailabilityContainer: Connected to availability endpoints
  - GeneratedScheduleContainer: Connected to schedule, conflicts, and classes endpoints
- Loading states and error handling in all container components
- Optimistic updates for mutations
- Comprehensive test suite for all visualization components
- Integration tests updated to work with MSW v2
- Logical input-to-output flow layout
- Grade-based filtering and week rotation support
- Conflict highlighting and visualization
- Error handling infrastructure:
  - Error context provider and hooks
  - Error boundary components
  - Error types and utilities
  - Error handling tests
- React Query integration:
  - Query client configuration
  - Schedule-specific query hooks
  - Mutation hooks with optimistic updates
  - Type-safe API integration
- MSW testing infrastructure:
  - Server setup and configuration
  - API endpoint handlers
  - Test fixtures and utilities
  - Integration tests for all components

## Specific Tasks
1. Test with Real Backend APIs:
   - Set up a local development environment with backend services running
   - Create end-to-end tests that connect to the real backend
   - Test all container components with real API endpoints
   - Verify data flow between frontend and backend
   - Test error handling with real API responses

2. Implement Performance Monitoring:
   - Add React Query devtools for monitoring cache and queries
   - Implement performance metrics using the Performance API
   - Add load time monitoring for critical components
   - Test with larger datasets to ensure performance
   - Optimize caching strategies for better performance

3. Add Tests for Edge Cases:
   - Test network failures and timeouts
   - Test invalid data responses
   - Test concurrent operations
   - Test with boundary conditions
   - Test error recovery scenarios

4. Prepare for Phase 2:
   - Document the current implementation
   - Create a transition plan to Phase 2
   - Identify any remaining issues or technical debt
   - Set up the foundation for FullCalendar integration
   - Plan for drag-and-drop functionality

## Implementation Approach
- Continue using the container component pattern we've established:
  - Presentational components focus on UI and user interactions
  - Container components handle data fetching, state management, and error handling
- Use the existing error handling infrastructure:
  - ErrorContext for global error state
  - ScheduleErrorBoundary for component-level error handling
  - useErrorHandler hook for API error handling
- Leverage React Query hooks from useScheduleQuery.ts:
  - useSchedule for fetching schedule data
  - useUpdateSchedule for modifying schedules
  - useGenerateSchedule for creating new schedules
  - Other specialized hooks for specific operations
- Implement performance monitoring:
  - Use React Query devtools for monitoring cache and queries
  - Use the Performance API for measuring component performance
  - Add custom metrics for critical operations
- Ensure responsive design and accessibility

Please help me test the container components with real backend APIs, implement performance monitoring, and add tests for edge cases in the Thunder Scheduler project, focusing on ensuring the integration between frontend and backend is robust and performant.