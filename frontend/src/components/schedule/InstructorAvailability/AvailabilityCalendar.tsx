import React from 'react';
import { DayOfWeek } from '../../../types/schedule.types';
import '../../../styles/components/availability-calendar.css';

interface TeacherAvailability {
  date: string;
  period: number;
}

interface AvailabilityCalendarProps {
  startDate: Date;
  blockedPeriods: TeacherAvailability[];
  onAvailabilityChange: (date: string, period: number) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
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

  const weekDates = getDatesForWeek();

  return (
    <div className="availability-calendar">
      {/* Empty cell for top-left corner */}
      <div />
      
      {/* Day headers with dates */}
      {weekDates.map((date, index) => (
        <div key={DAYS[index]} className="availability-header">
          <div className={`availability-date ${isToday(date) ? 'is-today' : ''}`}>
            {formatDate(date)}
          </div>
          <div className="availability-day">{DAYS[index]}</div>
        </div>
      ))}

      {/* Grid cells */}
      {PERIODS.map(period => (
        <React.Fragment key={period}>
          {/* Period label */}
          <div className="availability-period">
            Period {period}
          </div>

          {/* Availability cells */}
          {weekDates.map(date => (
            <button
              key={`${date.toISOString()}-${period}`}
              onClick={() => handleCellClick(date, period)}
              className={`availability-cell ${
                isBlocked(date, period) ? 'is-blocked' : 'is-available'
              } ${isToday(date) ? 'is-today' : ''}`}
              aria-label={`Toggle availability for ${
                DAYS[weekDates.indexOf(date)]
              } Period ${period}`}
              aria-pressed={isBlocked(date, period)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default AvailabilityCalendar;