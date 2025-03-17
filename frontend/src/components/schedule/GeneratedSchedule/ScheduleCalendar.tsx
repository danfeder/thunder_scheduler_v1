import React from 'react';
import { DayOfWeek, Assignment, Conflict } from '../../../types/schedule.types';
import { format, addDays, startOfWeek } from 'date-fns';
import ClassCard from './ClassCard';
import '../../../styles/components/schedule-calendar.css';

interface ScheduleCalendarProps {
  assignments: Assignment[];
  conflicts?: Conflict[];
  currentWeek: number;
  selectedGrade?: number;
  classGrades: Record<string, number>;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  assignments,
  conflicts = [],
  currentWeek,
  selectedGrade,
  classGrades,
}) => {
  // Calculate dates for the current week
  const weekDates = React.useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const weekOffset = (currentWeek - 1) * 7; // Adjust week based on rotation
    
    return DAYS.map((_, index) => {
      const date = addDays(monday, index + weekOffset);
      return date;
    });
  }, [currentWeek]);

  const getAssignmentsForCell = (day: DayOfWeek, period: number): Assignment[] => {
    return assignments.filter(
      a => 
        a.day === day && 
        a.period === period && 
        a.week === currentWeek &&
        (!selectedGrade || classGrades[a.classId] === selectedGrade)
    );
  };

  const getConflictsForAssignment = (assignment: Assignment): Conflict[] => {
    return conflicts.filter(
      c =>
        c.classId === assignment.classId &&
        c.day === assignment.day &&
        c.period === assignment.period
    );
  };

  const hasConflicts = (assignments: Assignment[]): boolean => {
    return assignments.some(assignment => 
      getConflictsForAssignment(assignment).length > 0 || assignments.length > 1
    );
  };

  return (
    <div className="schedule-calendar">
      {/* Empty cell for top-left corner */}
      <div />
      
      {/* Day headers with dates */}
      {DAYS.map((day, index) => (
        <div key={day} className="schedule-header">
          <div className="date-header">
            {format(weekDates[index], 'MMM d')}
          </div>
          <div>{day}</div>
        </div>
      ))}

      {/* Grid cells */}
      {PERIODS.map(period => (
        <React.Fragment key={period}>
          {/* Period label */}
          <div className="schedule-period">
            Period {period}
          </div>

          {/* Schedule cells */}
          {DAYS.map(day => {
            const cellAssignments = getAssignmentsForCell(day, period);
            const cellHasConflicts = hasConflicts(cellAssignments);
            
            return (
              <div
                key={`${day}-${period}`}
                className={`schedule-cell ${
                  cellHasConflicts ? 'has-conflict' : ''
                }`}
              >
                {cellAssignments.map(assignment => (
                  <div key={assignment.classId} className="schedule-class-card">
                    <ClassCard
                      classId={assignment.classId}
                      grade={classGrades[assignment.classId]}
                      conflicts={getConflictsForAssignment(assignment)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ScheduleCalendar;