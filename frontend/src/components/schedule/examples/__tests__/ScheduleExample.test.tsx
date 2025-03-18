import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchedule, useUpdateSchedule, useGenerateSchedule } from '../../../../hooks/useScheduleQuery';
import { vi, Mock } from 'vitest';
import ScheduleExample from '../ScheduleExample';

// Mock the hooks
vi.mock('../../../../hooks/useScheduleQuery');

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ScheduleExample', () => {
  const mockSchedule = {
    id: '123',
    startDate: '2025-03-17',
    endDate: '2025-04-17',
    rotationWeeks: 4,
    assignments: []
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    (useSchedule as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null
    });

    (useUpdateSchedule as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    });

    (useGenerateSchedule as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    });
  });

  it('shows loading spinner when loading', () => {
    (useSchedule as Mock).mockReturnValue({
      isLoading: true
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays schedule data when loaded', () => {
    (useSchedule as Mock).mockReturnValue({
      data: mockSchedule,
      isLoading: false
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    // Use a more reliable way to check for the schedule data
    const preElement = screen.getByText(/Current Schedule/i).nextElementSibling;
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain(mockSchedule.id);
  });

  it('handles update schedule action', async () => {
    const mockUpdateMutation = vi.fn();
    (useUpdateSchedule as Mock).mockReturnValue({
      mutateAsync: mockUpdateMutation,
      isPending: false
    });

    (useSchedule as Mock).mockReturnValue({
      data: mockSchedule,
      isLoading: false
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    fireEvent.click(screen.getByText('Update Schedule'));

    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalled();
    });
  });

  it('handles generate schedule action', async () => {
    const mockGenerateMutation = vi.fn();
    (useGenerateSchedule as Mock).mockReturnValue({
      mutateAsync: mockGenerateMutation,
      isPending: false
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    fireEvent.click(screen.getByText('Generate New Schedule'));

    await waitFor(() => {
      expect(mockGenerateMutation).toHaveBeenCalledWith({
        startDate: expect.any(String),
        endDate: expect.any(String),
        rotationWeeks: 4
      });
    });
  });

  it('shows pending state during mutations', () => {
    (useUpdateSchedule as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    (useSchedule as Mock).mockReturnValue({
      isError: true,
      error: new Error('Test error')
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    // Error will be handled by ErrorBoundary
    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });

  it('disables buttons during pending mutations', () => {
    (useUpdateSchedule as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Updating...')).toBeDisabled();
  });
});