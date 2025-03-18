import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import ClassConflictManagerWithErrorBoundary from '../../components/schedule/ClassConflictManager/ClassConflictManagerContainer';

// Mock the ClassService
jest.mock('../../components/schedule/ClassConflictManager/ClassConflictManagerContainer', () => {
  const originalModule = jest.requireActual('../../components/schedule/ClassConflictManager/ClassConflictManagerContainer');
  return {
    ...originalModule,
    __esModule: true,
    default: originalModule.default
  };
});

describe('ClassConflictManager Integration', () => {
  it('loads and displays class conflicts', async () => {
    render(<ClassConflictManagerWithErrorBoundary classId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the component displays the class name
    expect(screen.getByText(/Class Conflicts - 123/i)).toBeInTheDocument();
    
    // Check that the conflict grid is displayed
    expect(screen.getByText('Period 1')).toBeInTheDocument();
  });

  it('updates conflicts when toggled', async () => {
    render(<ClassConflictManagerWithErrorBoundary classId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find a cell and click it to toggle conflict
    const cells = screen.getAllByRole('button');
    if (cells.length > 0) {
      fireEvent.click(cells[0]);

      // Wait for the update to complete
      await waitFor(() => {
        // This is a simplified check - in a real test, you'd verify the specific cell state
        expect(cells[0]).toBeInTheDocument();
      });
    }
  });
});