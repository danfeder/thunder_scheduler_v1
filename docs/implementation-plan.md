# Thunder Scheduler Implementation Plan

## Proposed Technology Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- @hello-pangea/dnd for drag-and-drop functionality
- Custom grid-based calendar components

### Backend
- Node.js with Express.js
- TypeScript for type safety
- Google OR-Tools for constraint solving
- RESTful API design

### Database
- PostgreSQL with Prisma ORM (local development)
- Type-safe database access
- Docker for local database instance
- Easy transition to hosted solution later

## System Architecture

### Frontend Components
1. GeneratedSchedule
   - Complex calendar for final schedule display
   - Week rotation support
   - Grade-based filtering
   - Conflict visualization
   - Drag-and-drop class rescheduling ✅

2. InstructorAvailability
   - Date-based calendar for teacher scheduling
   - Period-based grid layout
   - Week navigation
   - Multi-period selection with drag and shift+click support ✅

3. ClassConflictManager
   - Simple grid for toggling class conflicts
   - Period-based conflict management
   - Conflict visualization
   - Soon: Multi-cell selection and bulk operations

4. Shared Infrastructure
   - Error handling context
   - React Query integration
   - Performance monitoring
   - Container components with real API implementations

### Backend Services
1. Schedule Service
   - Schedule generation logic
   - Manual adjustment handling
   - Schedule validation
   
2. Constraint Service
   - Constraint management
   - Validation rules
   - Conflict detection
   
3. OR-Tools Integration
   - Constraint satisfaction solver
   - Solution optimization
   - Constraint relaxation logic
   
4. Data Access Layer
   - Database operations
   - Data validation
   - Type-safe queries

## Core Data Models

```typescript
interface Class {
  id: string;
  name: string;
  gradeLevel: number;
  conflicts: DailyConflicts[];
}

interface DailyConflicts {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periods: number[];
}

interface Schedule {
  id: string;
  startDate: Date;
  endDate: Date;
  rotationWeeks: number;
  assignments: Assignment[];
}

interface Assignment {
  classId: string;
  day: string;
  period: number;
  week: number;
}

interface TeacherAvailability {
  id: string;
  date: Date;
  blockedPeriods: number[];
  reason?: string;
}
```

## Implementation Phases

### Phase 1: Core Scheduling System (4 weeks) [COMPLETED]
1. Project Setup (2 days) [COMPLETED]
   - Repository initialization ✅
   - Development environment setup ✅
   - Docker setup for PostgreSQL ✅
   - Create frontend dev server configuration ✅
   - Create backend dev server configuration ✅

2. Database Design (2 days) [COMPLETED]
   - PostgreSQL schema definition ✅
   - Prisma migration setup ✅
   - Initial seed data ✅
   - Development database setup with Docker ✅

3. OR-Tools Integration (5 days) [COMPLETED]
   - Basic solver setup ✅
   - Constraint modeling ✅
   - Solution validation ✅
   - Python integration with Node.js ✅

4. Basic Constraint Model (4 days) [COMPLETED]
   - Class conflict implementation ✅
   - Teacher availability ✅
   - Schedule limits ✅

5. CSV Import/Export (3 days) [COMPLETED]
   - File parsing ✅
   - Data validation ✅
   - Error handling ✅

6. Basic UI (4 days) [COMPLETED]
   - Core components ✅
   - State management ✅
   - API integration ✅

7. Schedule Visualization (4 days) [COMPLETED]
   - Basic calendar view ✅
   - Schedule display ✅
   - Conflict highlighting ✅

8. Initial Integration (3 days) [COMPLETED]
   - API endpoints ✅
   - Error handling ✅
   - Basic testing ✅
   - Performance monitoring ✅
   - Real API testing ✅

9. Pre-Phase 2 Preparation [DEFERRED]
   Note: These tasks have been moved to docs/deferred-tasks.md to focus on core functionality first:
   - Additional edge case testing
   - Performance testing with larger datasets
   - Enhanced error scenario testing
   - Detailed performance metrics implementation
   - Advanced load time monitoring
   - Caching strategy optimization

### Phase 2: Enhanced UI and Manual Adjustments (4 weeks)
1. GeneratedSchedule Enhancements (1 week)
   - React Beautiful DnD integration ✅
   - Draggable ClassCard component ✅
   - Drop zone implementation ✅
   - Real-time constraint validation ✅
   - Visual feedback during drag operations ✅
   - Performance optimization ✅

2. InstructorAvailability Improvements (1 week)
   - Multi-period selection
   - Drag-to-select functionality
   - Multi-period selection with useMultiPeriodSelection hook ✅
   - Improved period blocking interface

3. ClassConflictManager Updates (1 week)
   - Enhanced conflict visualization
   - Multi-cell selection
   - Bulk operations support
   - Pattern-based blocking
   - Improved constraint feedback
   - Undo/redo functionality

4. Cross-Component Integration (1 week)
   - Unified navigation experience
   - Consistent drag-drop behavior
   - Final testing and optimization

Note: Pre-Phase 2 tasks (comprehensive tests, advanced monitoring, etc.) have been moved to docs/deferred-tasks.md for future consideration. Focus is on delivering core functionality first.

## Constraint Implementation Strategy

### Hard Constraints
1. Class Conflicts
   - Parse from CSV data
   - Validate against schedule
   - Block conflicting slots

2. Teacher Availability
   - Calendar-based blocking
   - Recurring patterns
   - Override handling

3. Schedule Limits
   - Maximum classes per day
   - Maximum classes per week
   - Consecutive class limits

4. Required Breaks
   - Post-class period blocking
   - End of day handling
   - Exception management

### OR-Tools Integration Strategy

#### Python Integration with Node.js
The Thunder Scheduler will use Google OR-Tools' Python implementation for constraint solving, integrated with the Node.js backend using the python-shell package. This approach provides:

1. **Direct access to OR-Tools' full capabilities** through its native Python API
2. **Simple deployment** as a single service
3. **Clean separation** between business logic and constraint solving
4. **Efficient data passing** between Node.js and Python

#### Integration Architecture
- Node.js backend communicates with Python scripts via python-shell
- Python scripts use OR-Tools to solve constraint problems
- Data is passed as JSON between Node.js and Python
- Results are returned to Node.js for database storage and API responses

#### Python Component Structure
```
backend/
├── python/
│   ├── requirements.txt
│   ├── solver/
│   │   ├── constraint_solver.py
│   │   ├── model_builder.py
│   │   └── solution_validator.py
│   └── tests/
```

#### Node.js Integration Components
- **SolverService**: Interfaces with Python scripts via python-shell
- **ScheduleService**: Uses SolverService to generate and validate schedules
- **ScheduleController**: Exposes API endpoints for schedule operations

#### Constraint Model Implementation
```python
# Pseudo-code for constraint model
solver = cp_model.CpSolver()
model = cp_model.CpModel()

# Variables: class assignments to time slots
assignments = {}
for class in classes:
    for day in days:
        for period in periods:
            assignments[class, day, period] = model.NewBoolVar()

# Add constraints
# 1. Class conflicts
for class, day, periods in conflicts:
    model.Add(sum(assignments[class, day, p] for p in periods) == 0)

# 2. One class per slot
for day in days:
    for period in periods:
        model.Add(sum(assignments[c, day, period] for c in classes) <= 1)

# 3. Maximum classes per day
for day in days:
    model.Add(sum(assignments[c, day, p] for c in classes for p in periods) <= MAX_CLASSES_PER_DAY)

# 4. Consecutive class limits
for day in days:
    for p in range(len(periods) - 2):
        model.Add(sum(assignments[c, day, p:p+3] for c in classes) <= 2)
```

## Testing Strategy

### Unit Testing
- Individual constraint validation
- Data model validation
- Service layer functions
- Component testing with Vitest and React Testing Library

### Integration Testing
- API endpoint testing with MSW v2
- Database operations
- OR-Tools integration
- Component integration testing with mock services

### End-to-End Testing
- Schedule generation flows
- User interface interactions
- Data import/export
- API integration testing

## Development Guidelines

1. Code Organization
   - Feature-based directory structure
   - Clear separation of concerns
   - Shared type definitions

2. Error Handling
   - Consistent error types
   - User-friendly messages
   - Detailed logging

3. Performance Optimization
   - Efficient constraint checking
   - Lazy loading where appropriate
   - Caching strategies
   - Database query optimization
   - Connection pooling management

4. Documentation
   - API documentation
   - Component documentation
   - Setup instructions
   - Deployment guides
   - Environment configuration

5. Development Environment
   - Local development server configuration
   - Docker container management
   - Environment variables setup
   - Hot reloading configuration
   - Development database management
   - Local backup procedures

Note: Deployment to hosting services will be considered after core functionality is complete and tested locally.