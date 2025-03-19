import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InstructorAvailability from './index';
import { ScheduleErrorBoundary } from '../../shared/ScheduleErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { TeacherAvailability } from '../../../types/class.types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ScheduleService } from '../../../services/scheduleService';

interface InstructorAvailabilityContainerProps {
  teacherId: string;
}

interface BlockedPeriod {
  date: string;
  period: number;
}

const InstructorAvailabilityContainer: React.FC<InstructorAvailabilityContainerProps> = ({ teacherId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const { handleQueryError } = useErrorHandler();

  // Format date for API
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get start of week
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Get dates for the week
  const getWeekDates = (startDate: Date): string[] => {
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
      // Fetch availability for each date in the week
      const promises = weekDates.map(date => ScheduleService.getAvailability(date));
      const results = await Promise.all(promises);
      // Return empty array if no blocked periods
      return results.map(result => ({
        ...result,
        blockedPeriods: result?.blockedPeriods || []
      }));
    },
    throwOnError: true
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availability: TeacherAvailability) => ScheduleService.updateAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => handleQueryError(error)
  });

  // Handle availability change
  const handleAvailabilityChange = (blockedPeriods: BlockedPeriod[]) => {
    // Group by date
    const groupedByDate = blockedPeriods.reduce<Record<string, number[]>>((acc, { date, period }) => {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(period);
      return acc;
    }, {});

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
  const blockedPeriods = availabilityData.flatMap((availability: TeacherAvailability) => {
    if (!availability || !availability.blockedPeriods) return [];
    return availability.blockedPeriods.map(period => ({
      date: availability.date,
      period
    }));
  });

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