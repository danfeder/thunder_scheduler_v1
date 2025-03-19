import React, { useCallback, useRef } from 'react';
import { DayOfWeek } from '../../../types/schedule.types';
import { useMultiPeriodSelection } from '../../../hooks/useMultiPeriodSelection';
import '../../../styles/components/availability-calendar.css';

interface TeacherAvailability {
  date: string;
  period: number;
  isRecurring?: boolean;
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
  const calendarRef = useRef<HTMLDivElement>(null);

  // Get array of dates for the week starting from Monday
  const getDatesForWeek = useCallback((): Date[] => {
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    
    return DAYS.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [startDate]);

  const weekDates = getDatesForWeek();

  const handleSelectionComplete = useCallback((
    startDay: number,
    startPeriod: number,
    endDay: number,
    endPeriod: number
  ) => {
    const dates = getDatesForWeek();
    const startDayIndex = Math.min(startDay, endDay);
    const endDayIndex = Math.max(startDay, endDay);
    const periodStart = Math.min(startPeriod, endPeriod);
    const periodEnd = Math.max(startPeriod, endPeriod);

    for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
      for (let period = periodStart; period <= periodEnd; period++) {
        onAvailabilityChange(
          dates[dayIndex].toISOString().split('T')[0],
          period
        );
      }
    }
  }, [getDatesForWeek, onAvailabilityChange]);

  const {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleClick,
    isInSelection
  } = useMultiPeriodSelection({
    onSelectionComplete: handleSelectionComplete,
  });

  const isBlocked = useCallback((date: Date, period: number): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedPeriods.some(
      block => block.date === dateStr && block.period === period
    );
  }, [blockedPeriods]);

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

  return (
    <div 
      className="availability-calendar"
      ref={calendarRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
          {weekDates.map((date, dayIndex) => (
            <button
              key={`${date.toISOString()}-${period}`}
              onClick={(e) => handleClick(dayIndex, period, e)}
              onMouseDown={(e) => handleMouseDown(dayIndex, period, e)}
              onMouseEnter={() => handleMouseEnter(dayIndex, period)}
              className={`availability-cell ${
                isBlocked(date, period) ? 'is-blocked' : 'is-available'
              } ${isInSelection(dayIndex, period) ? 'is-selecting' : ''
              } ${isToday(date) ? 'is-today' : ''}`}
              aria-label={`Toggle availability for ${
                DAYS[dayIndex]
              } Period ${period}`}
              aria-pressed={isBlocked(date, period)}
              draggable={false}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default AvailabilityCalendar;