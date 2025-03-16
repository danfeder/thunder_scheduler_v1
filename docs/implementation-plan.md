# Thunder Scheduler Implementation Plan

## Proposed Technology Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- FullCalendar.js for calendar visualization
- React DnD for drag-and-drop functionality

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
1. Calendar View
   - Visual schedule representation
   - Weekly/monthly view toggle
   - Drag-and-drop interface
   
2. Schedule Editor
   - Manual schedule adjustments
   - Constraint violation highlighting
   - Unscheduled classes list
   
3. Constraint Manager
   - Teacher availability calendar
   - Class conflict management
   - Custom constraint configuration
   
4. Data Import/Export
   - CSV import interface
   - Multiple export formats
   - Printable calendar view

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

### Phase 1: Core Scheduling System (4 weeks)
1. Project Setup (2 days)
   - Repository initialization
   - Development environment setup
   - Docker setup for PostgreSQL
   - Create frontend dev server configuration
   - Create backend dev server configuration

2. Database Design (2 days)
   - PostgreSQL schema definition
   - Prisma migration setup
   - Initial seed data
   - Development database setup with Docker

3. OR-Tools Integration (5 days)
   - Basic solver setup
   - Constraint modeling
   - Solution validation

4. Basic Constraint Model (4 days)
   - Class conflict implementation
   - Teacher availability
   - Schedule limits

5. CSV Import/Export (3 days)
   - File parsing
   - Data validation
   - Error handling

6. Basic UI (4 days)
   - Core components
   - State management
   - API integration

7. Schedule Visualization (4 days)
   - Basic calendar view
   - Schedule display
   - Conflict highlighting

8. Initial Integration (3 days)
   - API endpoints
   - Error handling
   - Basic testing

### Phase 2: Enhanced UI and Manual Adjustments (3 weeks)
1. Calendar Implementation (5 days)
   - FullCalendar integration
   - View customization
   - Event handling

2. Drag-and-Drop System (4 days)
   - DnD setup
   - Constraint validation
   - Visual feedback

3. Teacher Availability (4 days)
   - Calendar interface
   - Availability management
   - Recurrence patterns

4. Constraint Visualization (3 days)
   - Conflict highlighting
   - Error messaging
   - Visual indicators

5. Export Formats (3 days)
   - Multiple format support
   - Print styling
   - Data formatting

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

### OR-Tools Integration
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

### Integration Testing
- API endpoint testing
- Database operations
- OR-Tools integration

### End-to-End Testing
- Schedule generation flows
- User interface interactions
- Data import/export

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