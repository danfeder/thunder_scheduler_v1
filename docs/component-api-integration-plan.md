# Thunder Scheduler: Component API Integration Implementation Plan

## Overview

This document outlines the detailed implementation plan for completing the Component API Integration phase of the Thunder Scheduler project. The plan follows the guidelines in `docs/implementation-plan.md` and `docs/initial-integration-plan.md`.

## Current Status Analysis

The project has three main visualization components that need to be connected to the backend:
- **ClassConflictManager**: For toggling class conflicts
- **InstructorAvailability**: For teacher scheduling
- **GeneratedSchedule**: For displaying the final schedule

The project already has:
- A well-structured `scheduleService.ts` with API endpoints for various operations
- React Query hooks in `useScheduleQuery.ts` for data fetching and mutations
- Error handling infrastructure in `useErrorHandler.ts`
- MSW setup for API mocking in tests
- An example component (`ScheduleExample.tsx`) showing proper API integration

However, the current components are not yet connected to the backend APIs:
- ClassConflictManager currently uses local state and a callback (onConflictsChange)
- InstructorAvailability also uses local state and a callback (onAvailabilityChange)
- GeneratedSchedule receives schedule data as props but doesn't fetch it

## Missing Backend Endpoints

After reviewing the backend code, we need to add the following endpoints:

1. **Get Schedule Conflicts**
   - Endpoint: `GET /api/schedule/:id/conflicts`
   - Purpose: Retrieve all conflicts for a specific schedule
   - Response: Array of Conflict objects

2. **Update Class Conflicts**
   - Endpoint: `PUT /api/class/:id/conflicts`
   - Purpose: Update the conflicts for a specific class
   - Request Body: Array of DailyConflicts objects
   - Response: Updated Class object

3. **Get Teacher Availability by Date**
   - Endpoint: `GET /api/availability/:date`
   - Purpose: Retrieve teacher availability for a specific date
   - Response: TeacherAvailability object

## Implementation Approach

We will follow a container component pattern, where:
1. The existing components remain as presentational components
2. New container components will handle API integration, loading states, and error handling
3. The container components will use React Query hooks for data fetching and mutations
4. Error boundaries will be used to handle errors gracefully

## Detailed Implementation Plan

### 1. ClassConflictManager Integration

#### 1.1 Create ClassConflictManagerContainer Component

```typescript
// src/components/schedule/ClassConflictManager/ClassConflictManagerContainer.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ClassConflictManager from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Class, DailyConflicts } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ScheduleService } from '../../../services/scheduleService';

interface ClassConflictManagerContainerProps {
  classId: string;
}

const ClassConflictManagerContainer: React.FC<ClassConflictManagerContainerProps> = ({ classId }) => {
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  // Fetch class data
  const { data: classData, isLoading, isError } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const response = await fetch(`/api/class/${classId}`);
      const data = await response.json();
      return data.data;
    },
    throwOnError: true
  });

  // Update conflicts mutation
  const updateConflictsMutation = useMutation({
    mutationFn: async (conflicts: DailyConflicts[]) => {
      const response = await fetch(`/api/class/${classId}/conflicts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conflicts)
      });
      const data = await response.json();
      return data.data;
    },
    onMutate: async (newConflicts) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['class', classId] });
      
      // Snapshot the previous value
      const previousClass = queryClient.getQueryData<Class>(['class', classId]);
      
      // Optimistically update to the new value
      if (previousClass) {
        queryClient.setQueryData(['class', classId], {
          ...previousClass,
          conflicts: newConflicts
        });
      }
      
      return { previousClass };
    },
    onError: (err, newConflicts, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousClass) {
        queryClient.setQueryData(['class', classId], context.previousClass);
      }
      handleQueryError(err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
    }
  });

  // Handle conflicts change
  const handleConflictsChange = (conflicts: DailyConflicts[]) => {
    updateConflictsMutation.mutate(conflicts);
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (isError || !classData) {
    return <div>Error loading class data</div>;
  }

  return (
    <ClassConflictManager
      classId={classId}
      initialConflicts={classData.conflicts}
      onConflictsChange={handleConflictsChange}
    />
  );
};

export const ClassConflictManagerWithErrorBoundary: React.FC<ClassConflictManagerContainerProps> = (props) => {
  return (
    <ScheduleErrorBoundary retryOnError>
      <ClassConflictManagerContainer {...props} />
    </ScheduleErrorBoundary>
  );
};

export default ClassConflictManagerWithErrorBoundary;
```

#### 1.2 Integration Test for ClassConflictManager

```typescript
// src/test/integration/ClassConflictManager.test.tsx
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { render } from '../test-utils';
import ClassConflictManagerWithErrorBoundary from '../../components/schedule/ClassConflictManager/ClassConflictManagerContainer';
import { mockClass } from '../fixtures';

describe('ClassConflictManager Integration', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('loads and displays class conflicts', async () => {
    const mockClassData = mockClass('123');
    
    server.use(
      http.get('http://localhost:3000/api/class/123', () => {
        return HttpResponse.json({
          data: mockClassData,
          success: true
        });
      })
    );

    render(<ClassConflictManagerWithErrorBoundary classId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the component displays the class name
    expect(screen.getByText(new RegExp(mockClassData.name, 'i'))).toBeInTheDocument();
    
    // Check that the conflict grid is displayed
    expect(screen.getByTestId('conflict-grid')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('http://localhost:3000/api/class/123', () => {
        return HttpResponse.json(
          { 
            success: false, 
            message: 'Class not found' 
          }, 
          { status: 404 }
        );
      })
    );

    render(<ClassConflictManagerWithErrorBoundary classId="123" />);

    // Wait for error state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('updates conflicts when toggled', async () => {
    const mockClassData = mockClass('123');
    
    server.use(
      http.get('http://localhost:3000/api/class/123', () => {
        return HttpResponse.json({
          data: mockClassData,
          success: true
        });
      }),
      http.put('http://localhost:3000/api/class/123/conflicts', async ({ request }) => {
        const conflicts = await request.json();
        return HttpResponse.json({
          data: {
            ...mockClassData,
            conflicts
          },
          success: true
        });
      })
    );

    render(<ClassConflictManagerWithErrorBoundary classId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find a cell and click it to toggle conflict
    const cell = screen.getAllByRole('button')[0];
    fireEvent.click(cell);

    // Wait for the update to complete
    await waitFor(() => {
      expect(cell).toHaveClass('bg-red-500');
    });
  });
});
```

### 2. InstructorAvailability Integration

#### 2.1 Create InstructorAvailabilityContainer Component

```typescript
// src/components/schedule/InstructorAvailability/InstructorAvailabilityContainer.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InstructorAvailability from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { TeacherAvailability } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface InstructorAvailabilityContainerProps {
  teacherId: string;
}

const InstructorAvailabilityContainer: React.FC<InstructorAvailabilityContainerProps> = ({ teacherId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  // Format date for API
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get start of week
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Get dates for the week
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 5; i++) { // Monday to Friday
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = getWeekDates(startOfWeek);

  // Fetch availability data for the week
  const { data: availabilityData, isLoading, isError } = useQuery({
    queryKey: ['availability', weekDates.join(',')],
    queryFn: async () => {
      const promises = weekDates.map(async date => {
        const response = await fetch(`/api/availability/${date}`);
        const data = await response.json();
        return data.data;
      });
      return Promise.all(promises);
    },
    throwOnError: true
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availability: TeacherAvailability) => {
      const response = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability)
      });
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => handleQueryError(error)
  });

  // Handle availability change
  const handleAvailabilityChange = (blockedPeriods: { date: string; period: number }[]) => {
    // Group by date
    const groupedByDate = blockedPeriods.reduce((acc, { date, period }) => {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(period);
      return acc;
    }, {} as Record<string, number[]>);

    // Update each date
    Object.entries(groupedByDate).forEach(([date, periods]) => {
      updateAvailabilityMutation.mutate({
        id: `avail-${date}`,
        date,
        blockedPeriods: periods,
        reason: 'Updated via UI'
      });
    });
  };

  // Handle week change
  const handleWeekChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (isError || !availabilityData) {
    return <div>Error loading availability data</div>;
  }

  // Convert availability data to the format expected by InstructorAvailability
  const blockedPeriods = availabilityData.flatMap((availability: TeacherAvailability) => 
    availability.blockedPeriods.map(period => ({
      date: availability.date,
      period
    }))
  );

  return (
    <InstructorAvailability
      teacherId={teacherId}
      initialBlockedPeriods={blockedPeriods}
      onAvailabilityChange={handleAvailabilityChange}
    />
  );
};

export const InstructorAvailabilityWithErrorBoundary: React.FC<InstructorAvailabilityContainerProps> = (props) => {
  return (
    <ScheduleErrorBoundary retryOnError>
      <InstructorAvailabilityContainer {...props} />
    </ScheduleErrorBoundary>
  );
};

export default InstructorAvailabilityWithErrorBoundary;
```

#### 2.2 Integration Test for InstructorAvailability

```typescript
// src/test/integration/InstructorAvailability.test.tsx
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { render } from '../test-utils';
import InstructorAvailabilityWithErrorBoundary from '../../components/schedule/InstructorAvailability/InstructorAvailabilityContainer';
import { mockTeacherAvailability } from '../fixtures';

describe('InstructorAvailability Integration', () => {
  beforeEach(() => {
    server.resetHandlers();
    
    // Mock date to ensure consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-06')); // A Monday
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads and displays teacher availability', async () => {
    // Setup handlers for each day of the week
    const weekDates = ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10'];
    
    weekDates.forEach(date => {
      server.use(
        http.get(`http://localhost:3000/api/availability/${date}`, () => {
          return HttpResponse.json({
            data: mockTeacherAvailability(date),
            success: true
          });
        })
      );
    });

    render(<InstructorAvailabilityWithErrorBoundary teacherId="teacher1" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the calendar is displayed
    expect(screen.getByTestId('availability-calendar')).toBeInTheDocument();
    
    // Check that the week navigation is displayed
    expect(screen.getByText(/week of/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('http://localhost:3000/api/availability/:date', () => {
        return HttpResponse.json(
          { 
            success: false, 
            message: 'Failed to fetch availability' 
          }, 
          { status: 500 }
        );
      })
    );

    render(<InstructorAvailabilityWithErrorBoundary teacherId="teacher1" />);

    // Wait for error state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('updates availability when toggled', async () => {
    // Setup handlers for each day of the week
    const weekDates = ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10'];
    
    weekDates.forEach(date => {
      server.use(
        http.get(`http://localhost:3000/api/availability/${date}`, () => {
          return HttpResponse.json({
            data: mockTeacherAvailability(date),
            success: true
          });
        })
      );
    });

    server.use(
      http.put('http://localhost:3000/api/availability', async ({ request }) => {
        const availability = await request.json();
        return HttpResponse.json({
          data: availability,
          success: true
        });
      })
    );

    render(<InstructorAvailabilityWithErrorBoundary teacherId="teacher1" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find a cell and click it to toggle availability
    const cells = screen.getAllByRole('button');
    const cell = cells.find(c => c.getAttribute('data-testid')?.includes('cell'));
    
    if (cell) {
      fireEvent.click(cell);

      // Wait for the update to complete
      await waitFor(() => {
        expect(cell).toHaveClass('bg-red-500');
      });
    }
  });
});
```

### 3. GeneratedSchedule Integration

#### 3.1 Create GeneratedScheduleContainer Component

```typescript
// src/components/schedule/GeneratedSchedule/GeneratedScheduleContainer.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GeneratedSchedule from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Schedule, Conflict } from '../../../types/schedule.types';
import { Class } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface GeneratedScheduleContainerProps {
  scheduleId: string;
}

const GeneratedScheduleContainer: React.FC<GeneratedScheduleContainerProps> = ({ scheduleId }) => {
  const { handleQueryError } = useErrorHandler();

  // Fetch schedule data
  const { data: schedule, isLoading: isLoadingSchedule, isError: isErrorSchedule } = useQuery<Schedule>({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      const response = await fetch(`/api/schedule/${scheduleId}`);
      const data = await response.json();
      return data.data;
    },
    throwOnError: true
  });

  // Fetch conflicts data
  const { data: conflicts, isLoading: isLoadingConflicts, isError: isErrorConflicts } = useQuery<Conflict[]>({
    queryKey: ['conflicts', scheduleId],
    queryFn: async () => {
      const response = await fetch(`/api/schedule/${scheduleId}/conflicts`);
      const data = await response.json();
      return data.data;
    },
    enabled: !!schedule, // Only fetch conflicts if schedule is loaded
    throwOnError: true
  });

  // Fetch classes data to get grade levels
  const { data: classes, isLoading: isLoadingClasses, isError: isErrorClasses } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await fetch('/api/class');
      const data = await response.json();
      return data.data;
    },
    throwOnError: true
  });

  const isLoading = isLoadingSchedule || isLoadingConflicts || isLoadingClasses;
  const isError = isErrorSchedule || isErrorConflicts || isErrorClasses;

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (isError || !schedule || !conflicts || !classes) {
    return <div>Error loading schedule data</div>;
  }

  // Create a map of class IDs to grade levels
  const classGrades = classes.reduce((acc, cls) => {
    acc[cls.id] = cls.gradeLevel;
    return acc;
  }, {} as Record<string, number>);

  return (
    <GeneratedSchedule
      schedule={schedule}
      conflicts={conflicts}
      classGrades={classGrades}
    />
  );
};

export const GeneratedScheduleWithErrorBoundary: React.FC<GeneratedScheduleContainerProps> = (props) => {
  return (
    <ScheduleErrorBoundary retryOnError>
      <GeneratedScheduleContainer {...props} />
    </ScheduleErrorBoundary>
  );
};

export default GeneratedScheduleWithErrorBoundary;
```

#### 3.2 Integration Test for GeneratedSchedule

```typescript
// src/test/integration/GeneratedSchedule.test.tsx
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { render } from '../test-utils';
import GeneratedScheduleWithErrorBoundary from '../../components/schedule/GeneratedSchedule/GeneratedScheduleContainer';
import { mockSchedule, mockClass } from '../fixtures';

describe('GeneratedSchedule Integration', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('loads and displays schedule data', async () => {
    const mockScheduleData = mockSchedule('123');
    const mockClasses = [mockClass('1'), mockClass('2'), mockClass('3')];
    const mockConflictsData = [
      { classId: '1', day: 'Monday', period: 3, type: 'class', message: 'Conflict with another class' }
    ];
    
    server.use(
      http.get('http://localhost:3000/api/schedule/123', () => {
        return HttpResponse.json({
          data: mockScheduleData,
          success: true
        });
      }),
      http.get('http://localhost:3000/api/schedule/123/conflicts', () => {
        return HttpResponse.json({
          data: mockConflictsData,
          success: true
        });
      }),
      http.get('http://localhost:3000/api/class', () => {
        return HttpResponse.json({
          data: mockClasses,
          success: true
        });
      })
    );

    render(<GeneratedScheduleWithErrorBoundary scheduleId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the schedule calendar is displayed
    expect(screen.getByTestId('schedule-calendar')).toBeInTheDocument();
    
    // Check that the week navigation is displayed
    expect(screen.getByText(/week/i)).toBeInTheDocument();
    
    // Check that conflicts are displayed
    expect(screen.getByText(/conflicts/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('http://localhost:3000/api/schedule/123', () => {
        return HttpResponse.json(
          { 
            success: false, 
            message: 'Schedule not found' 
          }, 
          { status: 404 }
        );
      })
    );

    render(<GeneratedScheduleWithErrorBoundary scheduleId="123" />);

    // Wait for error state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('filters by grade level', async () => {
    const mockScheduleData = mockSchedule('123');
    const mockClasses = [mockClass('1'), mockClass('2'), mockClass('3')];
    const mockConflictsData = [];
    
    server.use(
      http.get('http://localhost:3000/api/schedule/123', () => {
        return HttpResponse.json({
          data: mockScheduleData,
          success: true
        });
      }),
      http.get('http://localhost:3000/api/schedule/123/conflicts', () => {
        return HttpResponse.json({
          data: mockConflictsData,
          success: true
        });
      }),
      http.get('http://localhost:3000/api/class', () => {
        return HttpResponse.json({
          data: mockClasses,
          success: true
        });
      })
    );

    render(<GeneratedScheduleWithErrorBoundary scheduleId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find grade filter buttons
    const gradeButtons = screen.getAllByText(/grade/i);
    
    // Click on a grade filter
    if (gradeButtons.length > 0) {
      fireEvent.click(gradeButtons[0]);

      // Wait for the filter to be applied
      await waitFor(() => {
        expect(gradeButtons[0]).toHaveClass('bg-blue-500');
      });
    }
  });
});
```

### 4. Update MSW Handlers

We need to update the MSW handlers to support the new endpoints:

```typescript
// src/test/handlers/schedule.ts
// Add these handlers to the existing scheduleHandlers array

// Get schedule conflicts
http.get(`${API_URL}/schedule/:id/conflicts`, ({ params }) => {
  const { id } = params;
  return HttpResponse.json({
    data: [
      { 
        classId: '1', 
        day: 'Monday', 
        period: 3, 
        type: 'class', 
        message: 'Conflict with another class' 
      }
    ],
    success: true
  });
}),

// Update class conflicts
http.put(`${API_URL}/class/:id/conflicts`, async ({ params, request }) => {
  const { id } = params;
  const conflicts = await request.json();
  const classData = mockClass(id as string);
  
  return HttpResponse.json({
    data: {
      ...classData,
      conflicts
    },
    success: true
  });
}),

// Get teacher availability by date
http.get(`${API_URL}/availability/:date`, ({ params }) => {
  const { date } = params;
  return HttpResponse.json({
    data: mockTeacherAvailability(date as string),
    success: true
  });
})
```

## Implementation Timeline

### Day 1: ClassConflictManager Integration
- Create ClassConflictManagerContainer component
- Implement API integration with React Query
- Add loading and error states
- Create integration tests
- Verify functionality

### Day 2: InstructorAvailability Integration
- Create InstructorAvailabilityContainer component
- Implement date-based API integration
- Add loading and error states
- Create integration tests
- Verify functionality

### Day 3: GeneratedSchedule Integration
- Create GeneratedScheduleContainer component
- Implement schedule and conflicts API integration
- Add loading and error states
- Create integration tests
- Verify functionality

## Implementation Progress

### Current Status (March 18, 2025)

We have successfully implemented the container components for all three visualization components with real API implementations:

1. **ClassConflictManager**:
   - Created ClassConflictManagerContainer component with real API service
   - Implemented loading states and error handling
   - Added optimistic updates for mutations
   - Created integration tests that need to be updated for MSW v2

2. **InstructorAvailability**:
   - Created InstructorAvailabilityContainer component with real API service
   - Implemented date-based queries
   - Added loading states and error handling
   - Created integration tests that need to be updated for MSW v2

3. **GeneratedSchedule**:
   - Created GeneratedScheduleContainer component with real API service
   - Implemented loading states and error handling
   - Created integration tests that need to be updated for MSW v2

### Testing Infrastructure

- Updated Jest configuration to include integration tests
- Added cross-fetch polyfill for test environment
- Updated MSW handlers to use the v2 syntax (http instead of rest)
- Integration tests need to be fixed to work with MSW v2

### Implementation Approach

We've successfully replaced the mock services with real API implementations in each container component. This approach:
- Connects directly to backend APIs for real data
- Maintains proper error handling and loading states
- Preserves the same component structure and behavior
- Provides a clean separation between UI components and data fetching logic

## Next Steps

1. **Migrate Testing Framework**:
   - Migrate from Jest to Vitest for better MSW v2 compatibility
   - Update test configuration and setup files
   - Convert Jest-specific APIs to Vitest equivalents
   - Ensure all existing tests work with Vitest

2. **Fix Integration Tests**:
   - Update integration tests to work with MSW v2
   - Add necessary polyfills for the testing environment
   - Ensure all tests pass with the real API implementations

3. **Additional Testing**:
   - Add tests for edge cases like network failures
   - Test with larger datasets to ensure performance
   - Add tests for error scenarios with real APIs

4. **Performance Monitoring**:
   - Implement performance metrics
   - Add load time monitoring
   - Optimize caching strategies

5. **Documentation**:
   - Complete API integration patterns documentation
   - Create examples for other developers
   - Add performance guidelines
   - Document testing approach with Vitest and MSW v2

6. **Move on to Phase 2**: Enhanced UI and Manual Adjustments