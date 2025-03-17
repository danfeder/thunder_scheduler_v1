import React from 'react';
import Button from '../../shared/Button';

interface WeekNavigationProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  totalWeeks,
  onWeekChange,
}) => {
  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      onWeekChange(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks) {
      onWeekChange(currentWeek + 1);
    }
  };

  const handleFirstWeek = () => {
    onWeekChange(1);
  };

  const handleLastWeek = () => {
    onWeekChange(totalWeeks);
  };

  return (
    <div className="week-controls">
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          onClick={handleFirstWeek}
          disabled={currentWeek <= 1}
        >
          First
        </Button>
        <Button
          variant="secondary"
          onClick={handlePreviousWeek}
          disabled={currentWeek <= 1}
        >
          Previous
        </Button>
      </div>

      <div className="week-indicator">
        Week {currentWeek} of {totalWeeks}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          onClick={handleNextWeek}
          disabled={currentWeek >= totalWeeks}
        >
          Next
        </Button>
        <Button
          variant="secondary"
          onClick={handleLastWeek}
          disabled={currentWeek >= totalWeeks}
        >
          Last
        </Button>
      </div>
    </div>
  );
};

export default WeekNavigation;