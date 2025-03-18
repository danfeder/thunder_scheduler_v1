# Thunder Scheduler: Initial Integration Phase

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
- Error handling infrastructure and React Query integration (partial completion of Initial Integration)

All code is in the GitHub repository: https://github.com/danfeder/thunder_scheduler_v1
We're currently on the `feature/initial-integration` branch.

## Next Task: Complete Initial Integration
According to our progress tracker (docs/progress-tracker.md), we've partially completed Phase 1, Step 8: Initial Integration. We've implemented the error handling infrastructure and React Query setup, but still need to:
- Connect visualization components to backend APIs
- Implement component-specific integration tests
- Set up MSW for API mocking in tests

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

## Technical Requirements
The Initial Integration implementation needs to handle:

1. API Endpoints:
   - Connect frontend components to backend services *(infrastructure in place, need component-specific implementation)*
   - Implement proper data fetching and submission *(React Query hooks created, need component integration)*
   - Handle asynchronous operations gracefully *(loading states and error handling needed)*
   - Ensure type safety between frontend and backend *(type definitions in place)*

2. Error Handling:
   - Implement comprehensive error handling for API calls *(✓ completed)*
   - Display user-friendly error messages *(✓ completed)*
   - Add error boundaries for component failures *(✓ completed)*
   - Implement retry mechanisms where appropriate *(✓ completed)*

3. Basic Testing:
   - Integration tests for API endpoints *(MSW setup needed)*
   - End-to-end testing of key workflows *(component integration tests needed)*
   - Test error scenarios and recovery *(error testing utilities in place)*
   - Ensure proper data validation *(type validation in place)*

## Current Implementation
We've successfully implemented:
- Three distinct schedule visualization components:
  - ClassConflictManager: Simple grid for toggling class conflicts
  - InstructorAvailability: Date-based calendar for teacher scheduling
  - GeneratedSchedule: Complex calendar for displaying the final schedule
- Comprehensive test suite for all visualization components
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

## Specific Tasks
1. Complete API Integration:
   - Connect ClassConflictManager to backend conflict management endpoints
   - Integrate InstructorAvailability with teacher availability API
   - Link GeneratedSchedule with schedule generation and retrieval endpoints
   - Implement component-specific loading states

2. Set up Testing Infrastructure:
   - Install and configure MSW for API mocking
   - Create handlers for all API endpoints
   - Set up test fixtures and utilities
   - Add integration test setup

3. Implement Component Integration Tests:
   - Test ClassConflictManager API integration
   - Test InstructorAvailability API integration
   - Test GeneratedSchedule API integration
   - Test error scenarios and recovery

## Implementation Approach
- Continue using React with TypeScript for type safety
- Use the existing error handling infrastructure:
  - ErrorContext for global error state
  - ScheduleErrorBoundary for component-level error handling
  - useErrorHandler hook for API error handling
- Leverage React Query hooks from useScheduleQuery.ts:
  - useSchedule for fetching schedule data
  - useUpdateSchedule for modifying schedules
  - useGenerateSchedule for creating new schedules
  - Other specialized hooks for specific operations
- Follow the example in ScheduleExample.tsx for proper integration patterns
- Implement MSW for API mocking in tests
- Ensure responsive design and accessibility

Please help me complete the Initial Integration functionality for the Thunder Scheduler project, focusing on connecting the three main visualization components to the backend services and implementing comprehensive integration tests.