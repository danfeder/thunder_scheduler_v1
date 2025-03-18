# Thunder Scheduler: Initial Integration Phase - Component API Integration

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
- Container components with mock services for all visualization components
- Integration tests with mock services for all components

All code is in the GitHub repository: https://github.com/danfeder/thunder_scheduler_v1
We're currently on the `feature/initial-integration` branch.

## Next Task: Replace Mock Services with Real API Implementations
According to our updated progress tracker (docs/progress-tracker.md), we've made significant progress on Phase 1, Step 8: Initial Integration. We've implemented container components with mock services for all visualization components and created integration tests that are passing with these mock services. Now we need to:
- Replace mock services with real API implementations
- Update App.tsx to use the container components
- Test with real backend APIs
- Add tests for edge cases and error scenarios

## Key Documentation
Please refer to these files for detailed context:
- docs/project-brief.md: Contains the full project requirements
- docs/implementation-plan.md: Details the technical approach and architecture
- docs/progress-tracker.md: Shows what's been completed and what's next
- docs/initial-integration-plan.md: Detailed plan for the integration phase with progress tracking
- docs/schedule-visualization-plan-revised.md: Details the visualization components we've implemented
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
The Component API Integration implementation needs to handle:

1. API Integration:
   - Connect frontend components to backend services
   - Implement proper data fetching and submission
   - Handle asynchronous operations gracefully
   - Ensure type safety between frontend and backend

2. Component-Specific Integration:
   - ClassConflictManager: Connect to conflict management endpoints
   - InstructorAvailability: Connect to teacher availability API
   - GeneratedSchedule: Connect to schedule generation and retrieval endpoints
   - Implement loading states for all components

3. Integration Testing:
   - Leverage MSW setup for API mocking
   - Test component integration with backend services
   - Test error scenarios and recovery
   - Ensure proper data validation

## Current Implementation
We've successfully implemented:
- Three distinct schedule visualization components:
  - ClassConflictManager: Simple grid for toggling class conflicts
  - InstructorAvailability: Date-based calendar for teacher scheduling
  - GeneratedSchedule: Complex calendar for displaying the final schedule
- Container components for all visualization components:
  - ClassConflictManagerContainer: With mock service for class data and conflicts
  - InstructorAvailabilityContainer: With mock service for availability data
  - GeneratedScheduleContainer: With mock service for schedule, conflicts, and classes
- Loading states and error handling in all container components
- Optimistic updates for mutations
- Comprehensive test suite for all visualization components
- Integration tests with mock services for all components
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
1. Replace Mock Services with Real API Implementations:
   - Update scheduleService.ts to include methods for all required API operations
   - Replace mock services in ClassConflictManagerContainer with real API calls
   - Replace mock services in InstructorAvailabilityContainer with real API calls
   - Replace mock services in GeneratedScheduleContainer with real API calls
   - Ensure proper error handling for real API responses

2. Update App.tsx to Use Container Components:
   - Replace direct component usage with container components
   - Ensure proper props are passed to containers
   - Test the application flow with container components

3. Test with Real Backend APIs:
   - Update integration tests to work with real APIs
   - Add tests for edge cases and error scenarios
   - Implement performance monitoring
   - Ensure proper data validation

## Implementation Approach
- Continue using the container component pattern we've established:
  - Presentational components focus on UI and user interactions
  - Container components handle data fetching, state management, and error handling
- Update the scheduleService.ts to include all required API methods:
  - Methods for fetching and updating class conflicts
  - Methods for fetching and updating teacher availability
  - Methods for fetching and updating schedules
- Use the existing error handling infrastructure:
  - ErrorContext for global error state
  - ScheduleErrorBoundary for component-level error handling
  - useErrorHandler hook for API error handling
- Leverage React Query hooks from useScheduleQuery.ts:
  - useSchedule for fetching schedule data
  - useUpdateSchedule for modifying schedules
  - useGenerateSchedule for creating new schedules
  - Other specialized hooks for specific operations
- Update integration tests to work with real APIs
- Ensure responsive design and accessibility

Please help me replace the mock services with real API implementations in the Thunder Scheduler project, focusing on updating the scheduleService.ts file, connecting the container components to the backend services, and updating the integration tests to work with real APIs.