import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import GeneratedScheduleWithErrorBoundary from '../../components/schedule/GeneratedSchedule/GeneratedScheduleContainer';

// Mock the ScheduleService
jest.mock('../../components/schedule/GeneratedSchedule/GeneratedScheduleContainer', () => {
  const originalModule = jest.requireActual('../../components/schedule/GeneratedSchedule/GeneratedScheduleContainer');
  return {
    ...originalModule,
    __esModule: true,
    default: originalModule.default
  };
});

describe('GeneratedSchedule Integration', () => {
  beforeEach(() => {
    // Mock date to ensure consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-06')); // A Monday
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads and displays schedule data', async () => {
    render(<GeneratedScheduleWithErrorBoundary scheduleId="schedule1" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the component displays the schedule
    expect(screen.getByText(/Generated Schedule/i)).toBeInTheDocument();
  });

  it('displays class assignments correctly', async () => {
    render(<GeneratedScheduleWithErrorBoundary scheduleId="schedule1" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the component displays class assignments
    // Since we're using mock data, we know there should be assignments for class1, class2, and class3
    expect(screen.getByText('class1')).toBeInTheDocument();
  });
});