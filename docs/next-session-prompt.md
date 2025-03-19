# Thunder Scheduler: Phase 2 - InstructorAvailability Improvements

## Project Context
I'm working on the Thunder Scheduler project, a cooking class scheduler application that helps organize classes for 33 elementary school classes around existing schedule constraints. The project uses a constraint satisfaction approach with Google OR-Tools.

## Current Progress
We've completed Phase 1 of the project and have begun Phase 2:
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
- Container components with real API implementations for all visualization components
- Integration tests with mock services for all components
- Migration from Jest to Vitest for better MSW v2 compatibility
- Integration tests updated to work with MSW v2
- Basic real API testing implementation
- Initial performance monitoring utilities
- Health endpoint for backend status monitoring
- **COMPLETED Phase 2.1**: GeneratedSchedule Enhancements with drag-and-drop functionality
  - Added drag-and-drop support using @hello-pangea/dnd
  - Converted ClassCard to draggable component
  - Implemented drop zones with constraint validation
  - Added visual feedback during drag operations
  - Implemented real-time constraint checking
  - Added validation state feedback

All code is in the GitHub repository: https://github.com/danfeder/thunder_scheduler_v1
We're currently on the `feature/drag-drop-improvements` branch.

## Next Task: Phase 2.2 - InstructorAvailability Improvements
According to our Phase 2 implementation plan (docs/phase-2-implementation-plan.md), we've completed the first part (GeneratedSchedule Enhancements) and are now ready to move on to the second part: InstructorAvailability Improvements. This includes:

- Adding multi-period selection
- Implementing drag-to-select functionality
- Adding recurring availability patterns
- Creating pattern preview and editing
- Improving period blocking interface

## Key Documentation
Please refer to these files for detailed context:
- docs/project-brief.md: Contains the full project requirements
- docs/implementation-plan.md: Details the technical approach and architecture
- docs/progress-tracker.md: Shows what's been completed and what's next
- docs/phase-2-implementation-plan.md: Detailed plan for Phase 2 implementation
- docs/deferred-tasks.md: Tasks deferred for future consideration
- frontend/src/App.tsx: Main React application entry point
- frontend/src/components/schedule/: Directory containing all schedule visualization components
- frontend/src/components/schedule/GeneratedSchedule/: Newly enhanced schedule component with drag-drop
- frontend/src/components/schedule/InstructorAvailability/: Target component for improvements
- frontend/src/hooks/useDragDropSchedule.ts: New drag-drop functionality hook
- frontend/src/styles/components/schedule-calendar.css: Enhanced styles for drag-drop
- frontend/src/styles/components/availability-calendar.css: Styles to be enhanced

## Technical Requirements
The InstructorAvailability Improvements need to handle:

1. Multi-Period Selection:
   - Add drag-to-select for multiple periods at once
   - Implement shift+click for range selection
   - Provide visual feedback during selection
   - Handle touch events for mobile devices

2. Recurring Availability Patterns:
   - Allow marking patterns that repeat weekly
   - Provide pattern preview and editing
   - Implement exception handling for pattern overrides
   - Show recurring pattern indicators

3. Enhanced User Interface:
   - Improve period blocking visual feedback
   - Add keyboard navigation support
   - Implement consistent styling with GeneratedSchedule
   - Support both mouse and touch interactions

## Current Implementation
We've successfully implemented:
- Three distinct schedule visualization components:
  - ClassConflictManager: Simple grid for toggling class conflicts
  - InstructorAvailability: Date-based calendar for teacher scheduling
  - GeneratedSchedule: Complex calendar for displaying the final schedule
- Container components for all visualization components with real API implementations
- Loading states and error handling in all container components
- Optimistic updates for mutations
- Comprehensive test suite for all visualization components
- Integration tests with MSW v2
- Drag-and-drop functionality for GeneratedSchedule, including:
  - DraggableClassCard component for draggable class cards
  - DroppableCell component for drop zones
  - useDragDropSchedule hook for handling drag logic
  - Real-time constraint validation during drag
  - Visual feedback during drag operations

The InstructorAvailability component currently has the following structure:
- index.tsx: Main component wrapping calendar and navigation
- WeekNavigation.tsx: Controls for navigating between weeks
- AvailabilityCalendar.tsx: Grid-based calendar showing teacher availability
- WeekCalendar.tsx: Deprecated component to be removed
- InstructorAvailabilityContainer.tsx: Container component with API integration

## Specific Tasks
1. Enhance AvailabilityCalendar Component:
   - Add multi-select capabilities to AvailabilityCalendar
   - Implement drag-to-select functionality with mouse events
   - Add shift+click for range selection
   - Implement selection state management
   - Add visual feedback during selection

2. Add Recurring Pattern Support:
   - Design pattern data structure and UI
   - Add recurring pattern toggle
   - Implement pattern preview
   - Create pattern editor interface
   - Add pattern validation

3. Improve User Interface:
   - Enhance period blocking visual design
   - Implement consistent styling with GeneratedSchedule
   - Add keyboard navigation support
   - Ensure mobile-friendly interactions
   - Improve accessibility

4. Optimize Performance:
   - Implement memoization for expensive calculations
   - Optimize render performance
   - Add performance monitoring for multi-select operations
   - Test with large datasets

## Implementation Approach
- Enhance the existing AvailabilityCalendar component:
  - Add drag event handling for multi-selection
  - Implement selection state with React useState and useReducer
  - Create visual feedback components for selection
  - Add keyboard event handlers for accessibility
- Add recurring pattern support:
  - Extend the TeacherAvailability type to include pattern information
  - Create new components for pattern management
  - Implement pattern visualization
  - Add pattern editing interface
- Improve the UI:
  - Update styles to match the enhanced GeneratedSchedule
  - Add transition effects for better UX
  - Implement responsive design improvements
  - Add touch support for mobile
- Write comprehensive tests:
  - Unit tests for multi-select logic
  - Integration tests for recurring patterns
  - User interaction tests for selection behavior
  - Accessibility testing

Please help me implement the InstructorAvailability improvements for the Thunder Scheduler project, focusing first on multi-period selection functionality, then adding recurring pattern support, and finally improving the overall user interface.