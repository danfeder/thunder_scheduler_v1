import React from 'react';
import { Day, convertDay } from '../../../types/schedule.types';
import { DailyConflicts } from '../../../types/class.types';
import '../../../styles/components/conflict-grid.css';

interface ConflictGridProps {
  conflicts: DailyConflicts[];
  onConflictToggle: (day: Day, period: number) => void;
}

const DAYS: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY
];

const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

const ConflictGrid: React.FC<ConflictGridProps> = ({ conflicts, onConflictToggle }) => {
  const isBlocked = (day: Day, period: number): boolean => {
    const dayConflicts = conflicts.find(c => c.day === day);
    return dayConflicts ? dayConflicts.periods.includes(period) : false;
  };

  const handleCellClick = (day: Day, period: number) => {
    onConflictToggle(day, period);
  };

  return (
    <div className="conflict-grid" data-testid="conflict-grid">
      {/* Empty cell for top-left corner */}
      <div />
      
      {/* Day headers */}
      {DAYS.map(day => (
        <div key={day} className="conflict-header">
          {convertDay.toString(day)}
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
              aria-label={`Toggle conflict for ${convertDay.toString(day)} Period ${period}`}
              aria-pressed={isBlocked(day, period)}
              data-testid={`conflict-cell-${day}-${period}`}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ConflictGrid;