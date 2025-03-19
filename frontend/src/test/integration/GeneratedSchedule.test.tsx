import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { vi } from 'vitest';
import GeneratedScheduleWithErrorBoundary from '../../components/schedule/GeneratedSchedule/GeneratedScheduleContainer';
import { mockSchedule, mockClass } from '../fixtures';
import { Day } from '../../types/schedule.types';

describe('GeneratedSchedule Integration', () => {
  beforeEach(() => {
    // Mock date to ensure consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-06')); // A Monday
    
    // Reset handlers
    server.resetHandlers();
    
    // Setup handlers for this test
    server.use(
      http.get('http://localhost:3000/api/schedule/schedule1', () => {
        return HttpResponse.json({
          data: mockSchedule('schedule1'),
          success: true
        });
      }),
      http.get('http://localhost:3000/api/schedule/schedule1/conflicts', () => {
        return HttpResponse.json({
          data: [
            {
              classId: 'class1',
              day: Day.MONDAY,
              period: 3,
              type: 'class',
              message: 'Conflict with another class'
            }
          ],
          success: true
        });
      }),
      http.get('http://localhost:3000/api/class', () => {
        return HttpResponse.json({
          data: [mockClass('class1'), mockClass('class2'), mockClass('class3')],
          success: true
        });
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads and displays schedule with period grid', async () => {
    render(<GeneratedScheduleWithErrorBoundary scheduleId="schedule1" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check for schedule grid structure
    const scheduleGrid = screen.getByTestId('conflict-grid');
    expect(scheduleGrid).toBeInTheDocument();

    // Check for period labels (1-8)
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Period ${i}`)).toBeInTheDocument();
    }

    // Check for day headers
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
  });

  it('displays class assignments and conflicts correctly', async () => {
    render(<GeneratedScheduleWithErrorBoundary scheduleId="schedule1" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check for assignments from mock data
    await waitFor(() => {
      // Since we know we have a class1 with a conflict on Monday period 3
      const cell = screen.getByTestId(`conflict-cell-${Day.MONDAY}-3`);
      expect(cell).toHaveClass('is-blocked');
    });

    // Verify the conflict message is displayed
    expect(screen.getByText(/Conflict with another class/i)).toBeInTheDocument();
  });
});