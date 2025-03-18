import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { render } from '../test-utils';
import ClassConflictManager from '../../components/schedule/ClassConflictManager';
import { mockClass } from '../fixtures';
import { DayOfWeek } from '../../types/schedule.types';

interface DailyConflicts {
  day: DayOfWeek;
  periods: number[];
}

describe('ClassConflictManager Integration', () => {
  // Setup specific handlers for this test suite
  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers();
  });

  // Mock conflict change handler
  const mockOnConflictsChange = jest.fn();

  it('loads and displays class conflicts', async () => {
    // Render the component
    render(
      <ClassConflictManager 
        classId="123" 
        onConflictsChange={mockOnConflictsChange} 
      />
    );

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByTestId('conflict-grid')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override the default handler with an error response
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

    // Render the component
    render(
      <ClassConflictManager 
        classId="123" 
        onConflictsChange={mockOnConflictsChange} 
      />
    );

    // Wait for the error state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('displays the correct class name', async () => {
    const mockClassData = mockClass('123');
    
    // Override the default handler with custom data
    server.use(
      http.get('http://localhost:3000/api/class/123', () => {
        return HttpResponse.json({
          data: mockClassData,
          success: true
        });
      })
    );

    // Render the component
    render(
      <ClassConflictManager 
        classId="123" 
        onConflictsChange={mockOnConflictsChange} 
      />
    );

    // Wait for the class name to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockClassData.name)).toBeInTheDocument();
    });
  });
});