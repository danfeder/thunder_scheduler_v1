import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Conflict } from '../../../types/schedule.types';
import ClassCard from './ClassCard';

interface DraggableClassCardProps {
  classId: string;
  grade: number;
  conflicts?: Conflict[];
  index: number; // Required by react-beautiful-dnd for ordering
  isDragDisabled?: boolean;
}

const DraggableClassCard: React.FC<DraggableClassCardProps> = ({
  classId,
  grade,
  conflicts = [],
  index,
  isDragDisabled = false
}) => {
  return (
    <Draggable
      draggableId={classId}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-class-card ${
            snapshot.isDragging ? 'dragging' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1
          }}
        >
          <ClassCard
            classId={classId}
            grade={grade}
            conflicts={conflicts}
          />
        </div>
      )}
    </Draggable>
  );
};

export default DraggableClassCard;