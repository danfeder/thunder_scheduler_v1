import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Day, DayOfWeek, Assignment, Conflict, convertDay } from '../../../types/schedule.types';
import { format, addDays, startOfWeek } from 'date-fns';
import '../../../styles/components/schedule-calendar.css';
import DroppableCell from './DroppableCell';

interface ScheduleCalendarProps {
  assignments: Assignment[];
  conflicts?: Conflict[];
  currentWeek: number;
  selectedGrade?: number;
  classGrades: Record<string, number>;
  onDragEnd: (result: DropResult) => void;
}

const DAYS: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY
];

const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  assignments,
  conflicts = [],
  currentWeek,
  selectedGrade,
  classGrades,
  onDragEnd
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

  const getAssignmentsForCell = (day: Day, period: number): Assignment[] => {
    return assignments.filter(
      a => 
        a.day === day && 
        a.period === period && 
        a.week === currentWeek &&
        (!selectedGrade || classGrades[a.classId] === selectedGrade)
    );
  };

  const getConflictsForCell = (day: Day, period: number): Conflict[] => {
    try {
      if (!Array.isArray(conflicts)) {
        console.warn('[DEBUG] ScheduleCalendar: Conflicts is not an array:', conflicts);
        return [];
      }
      
      return conflicts.filter(conflict => {
        if (!conflict || typeof conflict !== 'object') {
          console.warn('[DEBUG] ScheduleCalendar: Invalid conflict object:', conflict);
          return false;
        }
        
        const hasConflict = conflict.day === day && conflict.period === period;
        
        if (hasConflict) {
          console.log('[DEBUG] ScheduleCalendar: Found conflict:', {
            day,
            period,
            conflict
          });
        }
        
        return hasConflict;
      });
    } catch (error) {
      console.error('[DEBUG] ScheduleCalendar: Error in getConflictsForCell:', error);
      return [];
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="schedule-calendar">
        {/* Empty cell for top-left corner */}
        <div />
        
        {/* Day headers with dates */}
        {DAYS.map((day, index) => (
          <div key={day} className="schedule-header">
            <div className="date-header">
              {format(weekDates[index], 'MMM d')}
            </div>
            <div>{convertDay.toString(day)}</div>
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
            {DAYS.map(day => (
              <DroppableCell
                key={`${day}-${period}`}
                day={day}
                period={period}
                assignments={getAssignmentsForCell(day, period)}
                conflicts={getConflictsForCell(day, period)}
                classGrades={classGrades}
                isDropDisabled={false}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </DragDropContext>
  );
};

export default ScheduleCalendar;