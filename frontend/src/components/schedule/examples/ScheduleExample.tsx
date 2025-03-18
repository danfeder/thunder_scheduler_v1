import React from 'react';
import { useSchedule, useUpdateSchedule, useGenerateSchedule } from '../../../hooks/useScheduleQuery';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import { Schedule } from '../../../types/schedule.types';
import { ApiError } from '../../../utils/error/types';
import LoadingSpinner from '../../shared/LoadingSpinner';

interface ScheduleExampleProps {
  scheduleId: string;
}

/**
 * Example component demonstrating proper usage of schedule hooks with error handling
 */
const ScheduleExample: React.FC<ScheduleExampleProps> = ({ scheduleId }) => {
  // Query hook with error handling
  const { 
    data: schedule,
    isLoading,
    isError,
    error
  } = useSchedule(scheduleId);

  // Mutation hooks with optimistic updates
  const updateMutation = useUpdateSchedule(scheduleId);
  const generateMutation = useGenerateSchedule();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  // Handle the update
  const handleUpdate = async (updates: Partial<Schedule>) => {
    try {
      await updateMutation.mutateAsync(updates);
    } catch (error) {
      // Error handling is automatic through useErrorHandler
      console.log('Update failed');
    }
  };

  // Generate new schedule
  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rotationWeeks: 4
      });
    } catch (error) {
      // Error handling is automatic through useErrorHandler
      console.log('Generation failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Schedule Example</h2>
      
      {/* Schedule Display */}
      {schedule && (
        <div className="mb-4">
          <h3 className="font-semibold">Current Schedule</h3>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(schedule, null, 2)}
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleUpdate({ /* sample updates */ })}
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Updating...' : 'Update Schedule'}
        </button>

        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate New Schedule'}
        </button>
      </div>

      {/* Loading States */}
      {(updateMutation.isPending || generateMutation.isPending) && (
        <div className="mt-4">
          <LoadingSpinner size="medium" />
        </div>
      )}
    </div>
  );
};

/**
 * Wrapped example with error boundary
 */
export const ScheduleExampleWithErrorBoundary: React.FC<ScheduleExampleProps> = (props) => {
  return (
    <ScheduleErrorBoundary retryOnError>
      <ScheduleExample {...props} />
    </ScheduleErrorBoundary>
  );
};

export default ScheduleExampleWithErrorBoundary;