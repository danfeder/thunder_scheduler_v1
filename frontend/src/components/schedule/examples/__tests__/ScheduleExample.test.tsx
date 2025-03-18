import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchedule, useUpdateSchedule, useGenerateSchedule } from '../../../../hooks/useScheduleQuery';
import ScheduleExample from '../ScheduleExample';

// Mock the hooks
jest.mock('../../../../hooks/useScheduleQuery');

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
    jest.clearAllMocks();

    // Setup default mock implementations
    (useSchedule as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null
    });

    (useUpdateSchedule as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false
    });

    (useGenerateSchedule as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false
    });
  });

  it('shows loading spinner when loading', () => {
    (useSchedule as jest.Mock).mockReturnValue({
      isLoading: true
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays schedule data when loaded', () => {
    (useSchedule as jest.Mock).mockReturnValue({
      data: mockSchedule,
      isLoading: false
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText(mockSchedule.id)).toBeInTheDocument();
  });

  it('handles update schedule action', async () => {
    const mockUpdateMutation = jest.fn();
    (useUpdateSchedule as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateMutation,
      isPending: false
    });

    (useSchedule as jest.Mock).mockReturnValue({
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
    const mockGenerateMutation = jest.fn();
    (useGenerateSchedule as jest.Mock).mockReturnValue({
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
    (useUpdateSchedule as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    (useSchedule as jest.Mock).mockReturnValue({
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
    (useUpdateSchedule as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true
    });

    render(<ScheduleExample scheduleId="123" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Updating...')).toBeDisabled();
  });
});