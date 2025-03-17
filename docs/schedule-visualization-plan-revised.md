# Revised Schedule Visualization Implementation Plan

## Overview

This revised plan emphasizes distinct, specialized components for each visualization need rather than a shared calendar base. Each component is optimized for its specific use case.

## Component Structure

```
frontend/src/components/schedule/
├── ClassConflictManager/
│   ├── index.tsx
│   └── ConflictGrid.tsx              # Simple grid for conflict toggles
├── InstructorAvailability/
│   ├── index.tsx
│   ├── AvailabilityCalendar.tsx     # Date-based calendar for availability
│   └── WeekNavigation.tsx
└── GeneratedSchedule/
    ├── index.tsx
    ├── ScheduleCalendar.tsx         # Specialized calendar for class schedule
    ├── WeekNavigation.tsx
    └── ClassCard.tsx
```

## Component Details

### 1. ConflictGrid (ClassConflictManager)
- Simple 5x8 grid layout (Days x Periods)
- No date handling
- Toggle cells for conflicts
- Binary states (conflicted/available)
- Focused on class-specific conflicts

### 2. AvailabilityCalendar (InstructorAvailability)
- Full calendar view with dates
- Week-based navigation
- Date-aware cells
- Current day highlighting
- Specific to teacher availability marking

### 3. ScheduleCalendar (GeneratedSchedule)
- Complex grid with class assignments
- Support for multiple classes per cell
- Conflict visualization
- Grade-based color coding
- Rotation week support

## Styling Approach

Each component maintains its own specific styles while sharing common utility classes:

### ConflictGrid Specific
```css
.conflict-grid {
  display: grid;
  grid-template-columns: auto repeat(5, 1fr);
}

.conflict-cell {
  @apply p-2 border rounded;
  /* Simple toggle styling */
}
```

### AvailabilityCalendar Specific
```css
.availability-calendar {
  display: grid;
  grid-template-columns: auto repeat(5, minmax(120px, 1fr));
}

.availability-cell {
  @apply min-h-[60px] relative;
  /* Date-specific styling */
}
```

### ScheduleCalendar Specific
```css
.schedule-calendar {
  display: grid;
  grid-template-columns: auto repeat(5, minmax(150px, 1fr));
}

.schedule-cell {
  @apply p-2 relative;
  /* Complex layout for multiple classes */
}
```

## Benefits of Separation

1. **Focused Components**
   - Each component handles only its specific use case
   - No conditional rendering based on mode
   - Clearer, more maintainable code

2. **Optimized Performance**
   - Simpler component structure
   - Fewer props and conditions
   - More efficient renders

3. **Better Maintainability**
   - Changes to one component don't affect others
   - Easier testing
   - Clearer separation of concerns

4. **Specialized Features**
   - Each component can implement exactly what it needs
   - No unused features or props
   - More intuitive API for each use case

## Implementation Timeline

### Day 1: Core Components
- Implement base structure for all three components
- Set up component-specific styling
- Basic layout and interactions

### Day 2: Feature Implementation
- ConflictGrid toggle functionality
- AvailabilityCalendar date handling
- ScheduleCalendar class display

### Day 3: Enhanced Features
- Add conflict visualization
- Implement week navigation
- Add grade filtering

### Day 4: Polish and Testing
- Add animations and transitions
- Implement responsive design
- Write component tests
- Add documentation

## Testing Strategy

Independent test suites for each component:

```typescript
describe('Schedule Components', () => {
  describe('ConflictGrid', () => {
    it('handles conflict toggles');
    it('displays initial conflicts');
  });

  describe('AvailabilityCalendar', () => {
    it('handles date navigation');
    it('marks availability correctly');
  });

  describe('ScheduleCalendar', () => {
    it('displays class assignments');
    it('shows conflicts properly');
  });
});