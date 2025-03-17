import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import { DayOfWeek } from '../../types/schedule.types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1); // 8 periods per day

const ScheduleDisplay: React.FC = () => {
  const { schedule, isLoading, error } = useSchedule();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-red-600 text-center py-4">
          Error loading schedule: {error}
        </div>
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card>
        <div className="text-gray-500 text-center py-4">
          No schedule selected. Create or import a schedule to get started.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Weekly Schedule" className="overflow-x-auto">
      <div className="min-w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {PERIODS.map((period) => (
              <tr key={period}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Period {period}
                </td>
                {DAYS.map((day) => {
                  const assignment = schedule.assignments.find(
                    (a) => a.day === day && a.period === period
                  );
                  return (
                    <td
                      key={`${day}-${period}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {assignment ? (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {assignment.classId}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ScheduleDisplay;