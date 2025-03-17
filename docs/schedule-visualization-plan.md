# Schedule Visualization Implementation Plan

## Overview

This document outlines the implementation of three distinct schedule visualization components for the Thunder Scheduler project:
1. Class Conflict Manager
2. Instructor Availability Calendar
3. Generated Schedule Display

## Component Structure

```
frontend/src/components/schedule/
├── ClassConflictManager/
│   ├── index.tsx
│   └── ConflictGrid.tsx
├── InstructorAvailability/
│   ├── index.tsx
│   ├── WeekCalendar.tsx
│   └── WeekNavigation.tsx
└── GeneratedSchedule/
    ├── index.tsx
    ├── ScheduleCalendar.tsx
    ├── WeekNavigation.tsx
    └── ClassCard.tsx
```

## 1. Class Conflict Manager

### Purpose
- Display and manage conflict periods for individual classes
- Simple grid interface for selecting blocked periods

### Features
- 5x8 grid layout (Monday-Friday x Periods 1-8)
- Clickable cells to toggle conflict status
- No week cycling required
- Clear visual indication of blocked periods

### Implementation Details
```typescript
interface ConflictGridProps {
  conflicts: DailyConflicts[];
  onConflictToggle: (day: DayOfWeek, period: number) => void;
}

// Grid implementation using CSS Grid
const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'auto repeat(5, 1fr)',  // Label column + 5 days
  gridTemplateRows: 'auto repeat(8, 1fr)',     // Header row + 8 periods
  gap: '1px',
  backgroundColor: 'var(--border-color)'
};
```

## 2. Instructor Availability Calendar

### Purpose
- Allow instructors to mark their unavailable periods
- Calendar-based interface with actual dates

### Features
- Calendar view with dates above weekdays
- Week navigation with date ranges
- Clickable periods for marking unavailability
- Clear today/current week indication

### Implementation Details
```typescript
interface InstructorCalendarProps {
  startDate: Date;
  blockedPeriods: TeacherAvailability[];
  onAvailabilityChange: (date: string, period: number) => void;
}

interface WeekNavigationProps {
  currentDate: Date;
  onWeekChange: (newDate: Date) => void;
}
```

## 3. Generated Schedule Display

### Purpose
- Display the final generated schedule
- Support multi-week rotation viewing

### Features
- Calendar view with dates above weekdays
- Week navigation for rotation weeks
- Color-coded class cards by grade level
- Clear class name display

### Implementation Details
```typescript
interface ScheduleCalendarProps {
  schedule: Schedule;
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

// Grade level color mapping
const gradeColors: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-purple-100 text-purple-800',
  5: 'bg-pink-100 text-pink-800'
};
```

## Shared Styling Guidelines

### Grid Layout
```css
.schedule-grid {
  @apply grid gap-1;
  grid-template-columns: auto repeat(5, minmax(120px, 1fr));
}

.period-cell {
  @apply p-2 border rounded;
}

.day-header {
  @apply font-semibold text-center p-2;
}

.period-label {
  @apply text-sm text-gray-600 text-right pr-4;
}
```

### Date Display
```css
.date-header {
  @apply text-xs text-gray-500 text-center;
}

.current-date {
  @apply font-bold text-blue-600;
}
```

### Class Cards
```css
.class-card {
  @apply rounded-lg shadow-sm p-2;
}

.class-name {
  @apply font-medium text-sm truncate;
}
```

## Implementation Timeline

### Day 1: Core Grid Components
- Implement basic grid layouts for all three components
- Add basic styling and responsive design
- Set up component structure and props

### Day 2: Calendar Integration
- Add date handling for instructor availability
- Implement week navigation
- Add date display above weekdays

### Day 3: Interactive Features
- Add conflict toggling for ClassConflictManager
- Implement availability marking for InstructorAvailability
- Set up class display for GeneratedSchedule

### Day 4: Polish and Testing
- Refine visual design and interactions
- Add loading and error states
- Implement comprehensive testing
- Add documentation

## Technical Considerations

### Performance
- Use React.memo for grid cells
- Optimize date calculations
- Minimize rerenders

### Accessibility
- Keyboard navigation support
- ARIA labels for interactive elements
- Color contrast compliance

### Testing Strategy
```typescript
describe('Schedule Components', () => {
  describe('ClassConflictManager', () => {
    it('toggles conflicts correctly');
    it('displays initial conflicts');
  });

  describe('InstructorAvailability', () => {
    it('handles week navigation');
    it('updates availability');
  });

  describe('GeneratedSchedule', () => {
    it('displays classes correctly');
    it('handles week rotation');
  });
});