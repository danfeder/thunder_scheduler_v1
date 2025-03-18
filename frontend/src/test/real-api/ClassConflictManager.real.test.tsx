import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderForRealApiTesting, isBackendRunning, waitForNetworkIdle } from '../utils/real-api-test-utils';
import ClassConflictManagerWithErrorBoundary from '../../components/schedule/ClassConflictManager/ClassConflictManagerContainer';
import { beforeAll, describe, it, expect } from 'vitest';

/**
 * Real API integration tests for ClassConflictManager
 * These tests connect to the actual backend API
 * 
 * To run these tests:
 * 1. Make sure the backend server is running
 * 2. Run: npm test -- -t "Real API"
 */
describe('ClassConflictManager Real API Integration', () => {
  let backendAvailable = false;

  // Check if backend is running before all tests
  beforeAll(async () => {
    backendAvailable = await isBackendRunning();
    if (!backendAvailable) {
      console.warn('Backend server is not running. Real API tests will be skipped.');
    }
  });

  // Skip tests if backend is not available
  const conditionalTest = backendAvailable ? it : it.skip;

  conditionalTest('loads and displays class data from real API', async () => {
    // Use a known class ID from the backend
    const classId = '1';
    
    // Render with real API testing utilities
    renderForRealApiTesting(<ClassConflictManagerWithErrorBoundary classId={classId} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for network requests to settle
    await waitForNetworkIdle(1000);

    // Check that the component renders without error
    const errorElement = screen.queryByText(/error/i);
    expect(errorElement).not.toBeInTheDocument();

    // Check for the conflict grid
    const gridElement = document.querySelector('.conflict-grid') ||
                        document.querySelector('[data-testid="conflict-grid"]');
    expect(gridElement).not.toBeNull();
  });

  conditionalTest('handles toggling conflicts with real API', async () => {
    // Use a known class ID from the backend
    const classId = '1';
    
    // Render with real API testing utilities
    const { container } = renderForRealApiTesting(<ClassConflictManagerWithErrorBoundary classId={classId} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for network requests to settle
    await waitForNetworkIdle(1000);

    // Find a cell in the grid
    const cells = container.querySelectorAll('.conflict-cell') || 
                  container.querySelectorAll('[data-testid^="conflict-cell"]') ||
                  container.querySelectorAll('button');
    
    expect(cells.length).toBeGreaterThan(0);
    
    if (cells.length > 0) {
      // Get the first cell
      const cell = cells[0] as HTMLElement;
      
      // Get initial state
      const initialState = cell.classList.contains('bg-red-500') || 
                          cell.classList.contains('conflict-active');
      
      // Click to toggle
      fireEvent.click(cell);
      
      // Wait for the update to complete
      await waitForNetworkIdle(2000);
      
      // Check that the state has changed
      const newState = cell.classList.contains('bg-red-500') || 
                      cell.classList.contains('conflict-active');
      
      // The new state should be the opposite of the initial state
      expect(newState).not.toBe(initialState);
    }
  });

  conditionalTest('handles error responses from real API', async () => {
    // Use a non-existent class ID
    const invalidClassId = 'non-existent-id';
    
    // Render with real API testing utilities
    renderForRealApiTesting(<ClassConflictManagerWithErrorBoundary classId={invalidClassId} />);

    // Wait for error state to be displayed
    await waitFor(() => {
      const errorElement = screen.queryByText(/error/i) || 
                          screen.queryByText(/not found/i) ||
                          screen.queryByText(/failed/i);
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  conditionalTest('handles network failures gracefully', async () => {
    // Use a valid class ID but with an invalid API endpoint
    const classId = '1';
    
    // Mock fetch to simulate network failure for this specific test
    const originalFetch = window.fetch;
    window.fetch = async (input) => {
      const url = input instanceof Request ? input.url : input.toString();
      
      // Simulate network failure only for the class endpoint
      if (url.includes(`/api/class/${classId}`)) {
        throw new Error('Network failure');
      }
      
      // Otherwise use the original fetch
      return originalFetch(input);
    };
    
    // Render with real API testing utilities
    renderForRealApiTesting(<ClassConflictManagerWithErrorBoundary classId={classId} />);

    // Wait for error state to be displayed
    await waitFor(() => {
      const errorElement = screen.queryByText(/error/i) || 
                          screen.queryByText(/network/i) ||
                          screen.queryByText(/failed/i);
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Restore original fetch
    window.fetch = originalFetch;
  });

  conditionalTest('handles concurrent operations correctly', async () => {
    // Use a known class ID from the backend
    const classId = '1';
    
    // Render with real API testing utilities
    const { container } = renderForRealApiTesting(<ClassConflictManagerWithErrorBoundary classId={classId} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Find cells in the grid
    const cells = container.querySelectorAll('.conflict-cell') || 
                  container.querySelectorAll('[data-testid^="conflict-cell"]') ||
                  container.querySelectorAll('button');
    
    expect(cells.length).toBeGreaterThan(1);
    
    if (cells.length > 1) {
      // Click multiple cells in quick succession
      fireEvent.click(cells[0]);
      fireEvent.click(cells[1]);
      
      // Wait for all updates to complete
      await waitForNetworkIdle(3000);
      
      // Check that the component is still in a valid state
      const errorElement = screen.queryByText(/error/i);
      expect(errorElement).not.toBeInTheDocument();
    }
  });
});