import React, { useState } from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import WeekNavigation from './WeekNavigation';
import ScheduleCalendar from './ScheduleCalendar';
import { Schedule, Conflict } from '../../../types/schedule.types';

interface GeneratedScheduleProps {
  schedule: Schedule;
  conflicts: Conflict[];
  classGrades: Record<string, number>;
}

const GeneratedSchedule: React.FC<GeneratedScheduleProps> = ({
  schedule,
  conflicts,
  classGrades,
}) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>();

  const handleWeekChange = (week: number) => {
    setCurrentWeek(week);
  };

  // Get unique grades from classGrades
  const grades = Array.from(
    new Set(Object.values(classGrades))
  ).sort((a, b) => a - b);

  return (
    <Card 
      title="Generated Schedule"
      className="max-w-6xl mx-auto"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <WeekNavigation
            currentWeek={currentWeek}
            totalWeeks={schedule.rotationWeeks}
            onWeekChange={handleWeekChange}
          />
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter by grade:</span>
            <Button
              variant={!selectedGrade ? 'primary' : 'secondary'}
              onClick={() => setSelectedGrade(undefined)}
            >
              All
            </Button>
            {grades.map(grade => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? 'primary' : 'secondary'}
                onClick={() => setSelectedGrade(grade)}
              >
                Grade {grade}
              </Button>
            ))}
          </div>
        </div>

        <ScheduleCalendar
          assignments={schedule.assignments}
          conflicts={conflicts}
          currentWeek={currentWeek}
          selectedGrade={selectedGrade}
          classGrades={classGrades}
        />

        {conflicts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h3 className="text-red-800 font-semibold mb-2">
              Schedule Conflicts ({conflicts.length})
            </h3>
            <ul className="space-y-1">
              {conflicts.map((conflict, index) => (
                <li key={index} className="text-sm text-red-600">
                  {conflict.message} (Class {conflict.classId}, {conflict.day} Period {conflict.period})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GeneratedSchedule;