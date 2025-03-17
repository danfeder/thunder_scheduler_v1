import React from 'react';
import { DayOfWeek } from '../../../types/schedule.types';
import '../../../styles/components/conflict-grid.css';

interface DailyConflicts {
  day: DayOfWeek;
  periods: number[];
}

interface ConflictGridProps {
  conflicts: DailyConflicts[];
  onConflictToggle: (day: DayOfWeek, period: number) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

const ConflictGrid: React.FC<ConflictGridProps> = ({ conflicts, onConflictToggle }) => {
  const isBlocked = (day: DayOfWeek, period: number): boolean => {
    const dayConflicts = conflicts.find(c => c.day === day);
    return dayConflicts ? dayConflicts.periods.includes(period) : false;
  };

  const handleCellClick = (day: DayOfWeek, period: number) => {
    onConflictToggle(day, period);
  };

  return (
    <div className="conflict-grid">
      {/* Empty cell for top-left corner */}
      <div />
      
      {/* Day headers */}
      {DAYS.map(day => (
        <div key={day} className="conflict-header">
          {day}
        </div>
      ))}

      {/* Grid cells */}
      {PERIODS.map(period => (
        <React.Fragment key={period}>
          {/* Period label */}
          <div className="conflict-period">
            Period {period}
          </div>

          {/* Conflict cells */}
          {DAYS.map(day => (
            <button
              key={`${day}-${period}`}
              onClick={() => handleCellClick(day, period)}
              className={`conflict-cell ${
                isBlocked(day, period) ? 'is-blocked' : 'is-available'
              }`}
              aria-label={`Toggle conflict for ${day} Period ${period}`}
              aria-pressed={isBlocked(day, period)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ConflictGrid;