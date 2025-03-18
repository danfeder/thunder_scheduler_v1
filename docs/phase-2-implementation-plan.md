# Thunder Scheduler: Phase 2 Implementation Plan (Revised)

## Overview

Phase 2 focuses on enhancing our three existing calendar components with drag-and-drop functionality and improved visualizations:

1. GeneratedSchedule
2. InstructorAvailability
3. ClassConflictManager

## Implementation Approach

### 1. Enhance GeneratedSchedule (1 week) [COMPLETED]

#### 1.1 Add Drag-and-Drop ✅
- Install @hello-pangea/dnd ✅
- Convert ClassCard to be draggable ✅
- Make schedule cells droppable ✅
- Add visual feedback during drag ✅
- Implement drop validation ✅

```typescript
// Example implementation of DraggableClassCard
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Conflict } from '../../../types/schedule.types';
import ClassCard from './ClassCard';

interface DraggableClassCardProps {
  classId: string;
  grade: number;
  conflicts?: Conflict[];
  index: number;
  isDragDisabled?: boolean;
}

const DraggableClassCard: React.FC<DraggableClassCardProps> = ({
  classId,
  grade,
  conflicts = [],
  index,
  isDragDisabled = false
}) => {
  return (
    <Draggable
      draggableId={classId}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-class-card ${
            snapshot.isDragging ? 'dragging' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1
          }}
        >
          <ClassCard
            classId={classId}
            grade={grade}
            conflicts={conflicts}
          />
        </div>
      )}
    </Draggable>
  );
};

export default DraggableClassCard;
```

#### 1.2 Add Constraint Validation ✅
- Real-time constraint checking during drag ✅
- Visual feedback for valid/invalid drops ✅
- Update conflict highlighting ✅
- Add validation state feedback ✅

### 2. Enhance InstructorAvailability (1 week)

#### 2.1 Add Multi-Period Selection
- Implement drag-to-select multiple periods
- Add shift+click range selection
- Improve period blocking UI
- Add keyboard navigation

```typescript
// Example enhancement to AvailabilityCalendar
interface EnhancedAvailabilityCalendarProps {
  startDate: Date;
  blockedPeriods: TeacherAvailability[];
  onAvailabilityChange: (changes: AvailabilityChange[]) => void;
  allowMultiSelect: boolean;
  showRecurringOptions: boolean;
}

interface AvailabilityChange {
  date: string;
  period: number;
  isBlocked: boolean;
  isRecurring?: boolean;
}
```

#### 2.2 Add Recurring Patterns
- Weekly pattern support
- Pattern preview
- Pattern editing
- Exception handling

### 3. Enhance ClassConflictManager (1 week)

#### 3.1 Improve Conflict Visualization
- Enhanced conflict highlighting
- Detailed constraint information
- Conflict impact preview
- Relationship visualization

```typescript
// Example enhancement to ConflictGrid
interface EnhancedConflictGridProps {
  conflicts: DailyConflicts[];
  onConflictToggle: (day: DayOfWeek, period: number) => void;
  showImpact?: boolean;
  highlightRelated?: boolean;
  showConstraintDetails?: boolean;
}

interface ConflictImpact {
  affectedClasses: string[];
  severityLevel: 'low' | 'medium' | 'high';
  resolutionHints: string[];
}
```

#### 3.2 Add Bulk Operations
- Multi-cell selection
- Pattern-based blocking
- Bulk clear operations
- Undo/redo support

### 4. Cross-Component Improvements (1 week)

#### 4.1 Unified Navigation
- Consistent week navigation
- Improved grade filtering
- Quick jump to dates
- Saved view preferences

#### 4.2 Shared Features
- Consistent drag-drop behavior
- Unified keyboard shortcuts
- Common styling improvements
- Accessibility enhancements

## Implementation Timeline

### Week 1: GeneratedSchedule Enhancements [COMPLETED]
- [x] Day 1-2: Implement drag-and-drop
- [x] Day 3: Add constraint validation
- [x] Day 4: Improve visual feedback
- [x] Day 5: Testing and refinement

### Week 2: InstructorAvailability Improvements
- [ ] Day 1-2: Add multi-select
- [ ] Day 3: Implement recurring patterns
- [ ] Day 4: Add pattern preview
- [ ] Day 5: Testing and refinement

### Week 3: ClassConflictManager Updates
- [ ] Day 1-2: Enhance conflict visualization
- [ ] Day 3: Add bulk operations
- [ ] Day 4: Implement undo/redo
- [ ] Day 5: Testing and refinement

### Week 4: Cross-Component Integration
- [ ] Day 1-2: Unify navigation
- [ ] Day 3: Implement shared features
- [ ] Day 4: Accessibility improvements
- [ ] Day 5: Final testing

## Technical Dependencies

### Required Packages
```json
{
  "@hello-pangea/dnd": "^13.1.0",
  "@floating-ui/react": "^0.24.0"
}
```

## Testing Strategy

### Unit Tests
- Component-specific behavior
- Drag-drop interactions
- Constraint validation
- Pattern handling

### Integration Tests
- Cross-component interactions
- State management
- Data consistency

### User Testing
- Navigation flow
- Drag-drop usability
- Constraint feedback
- Multi-select operations

## Success Criteria

### Must Have
1. Working drag-and-drop in GeneratedSchedule ✅
2. Multi-period selection in InstructorAvailability
3. Enhanced conflict visualization in ClassConflictManager
4. Consistent cross-component behavior

### Should Have
1. Recurring availability patterns
2. Bulk operations
3. Improved navigation
4. Advanced constraint visualization

### Nice to Have
1. Undo/redo support
2. Pattern previews
3. Keyboard shortcuts
4. Advanced filtering

## Next Steps

1. User feedback collection
2. Performance optimization
3. Feature refinement
4. Additional enhancements based on usage patterns