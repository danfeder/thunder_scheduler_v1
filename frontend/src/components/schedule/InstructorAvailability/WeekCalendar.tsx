import React from 'react';
import { DayOfWeek } from '../../../types/schedule.types';

interface TeacherAvailability {
  date: string;
  period: number;
}

interface WeekCalendarProps {
  startDate: Date;
  blockedPeriods: TeacherAvailability[];
  onAvailabilityChange: (date: string, period: number) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  startDate,
  blockedPeriods,
  onAvailabilityChange,
}) => {
  // Get array of dates for the week starting from Monday
  const getDatesForWeek = (): Date[] => {
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    
    return DAYS.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const weekDates = getDatesForWeek();

  const isBlocked = (date: Date, period: number): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedPeriods.some(
      block => block.date === dateStr && block.period === period
    );
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleCellClick = (date: Date, period: number) => {
    onAvailabilityChange(date.toISOString().split('T')[0], period);
  };

  return (
    <div className="schedule-grid">
      {/* Empty cell for top-left corner */}
      <div className="p-2" />
      
      {/* Day headers with dates */}
      {weekDates.map((date, index) => (
        <div key={DAYS[index]} className="day-header">
          <div className={`date-header ${isToday(date) ? 'current-date' : ''}`}>
            {formatDate(date)}
          </div>
          <div>{DAYS[index]}</div>
        </div>
      ))}

      {/* Grid cells */}
      {PERIODS.map(period => (
        <React.Fragment key={period}>
          {/* Period label */}
          <div className="period-label">
            Period {period}
          </div>

          {/* Availability cells */}
          {weekDates.map(date => (
            <button
              key={`${date.toISOString()}-${period}`}
              onClick={() => handleCellClick(date, period)}
              className={`period-cell ${
                isBlocked(date, period)
                  ? 'bg-red-100 hover:bg-red-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors duration-150`}
              aria-label={`Toggle availability for ${
                DAYS[weekDates.indexOf(date)]
              } Period ${period}`}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WeekCalendar;