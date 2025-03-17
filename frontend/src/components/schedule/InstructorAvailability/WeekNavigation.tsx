import React from 'react';
import Button from '../../shared/Button';

interface WeekNavigationProps {
  currentDate: Date;
  onWeekChange: (newDate: Date) => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentDate,
  onWeekChange,
}) => {
  const getWeekRange = (date: Date): string => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 4); // Friday

    const formatDate = (d: Date): string =>
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onWeekChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onWeekChange(newDate);
  };

  const handleCurrentWeek = () => {
    onWeekChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <Button onClick={handlePreviousWeek} variant="secondary">
        Previous Week
      </Button>

      <div className="flex flex-col items-center">
        <button
          onClick={handleCurrentWeek}
          className="text-sm text-gray-500 hover:text-gray-700 mb-1"
        >
          Today
        </button>
        <span className="text-lg font-semibold">
          {getWeekRange(currentDate)}
        </span>
      </div>

      <Button onClick={handleNextWeek} variant="secondary">
        Next Week
      </Button>
    </div>
  );
};

export default WeekNavigation;