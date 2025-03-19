import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Assignment, Conflict, Day } from '../../../types/schedule.types';
import DraggableClassCard from './DraggableClassCard';

interface DroppableCellProps {
  day: Day;
  period: number;
  assignments: Assignment[];
  conflicts?: Conflict[];
  classGrades: Record<string, number>;
  isDropDisabled?: boolean;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  day,
  period,
  assignments,
  conflicts = [],
  classGrades,
  isDropDisabled = false
}) => {
  const droppableId = `${day}-${period}`;
  const hasConflicts = conflicts.length > 0;

  return (
    <Droppable
      droppableId={droppableId}
      isDropDisabled={isDropDisabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`schedule-cell ${
            hasConflicts ? 'has-conflict' : ''
          } ${
            snapshot.isDraggingOver ? 'dragging-over' : ''
          } ${
            isDropDisabled ? 'drop-disabled' : ''
          }`}
        >
          {assignments.map((assignment, index) => (
            <DraggableClassCard
              key={assignment.classId}
              classId={assignment.classId}
              grade={classGrades[assignment.classId]}
              conflicts={conflicts.filter(c => c.classId === assignment.classId)}
              index={index}
              isDragDisabled={false}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DroppableCell;