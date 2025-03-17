import React from 'react';
import { Conflict } from '../../../types/schedule.types';
import '../../../styles/components/schedule-calendar.css';

interface ClassCardProps {
  classId: string;
  grade: number;
  conflicts?: Conflict[];
}

const ClassCard: React.FC<ClassCardProps> = ({ classId, grade, conflicts = [] }) => {
  const hasConflicts = conflicts.length > 0;

  const getConflictSummary = (): string => {
    if (!hasConflicts) return '';
    
    const conflictTypes = conflicts.map(c => c.type);
    const uniqueTypes = [...new Set(conflictTypes)];
    
    return uniqueTypes.map(type => {
      const count = conflicts.filter(c => c.type === type).length;
      return `${count} ${type}${count > 1 ? 's' : ''}`;
    }).join(', ');
  };

  return (
    <div 
      className={`class-card grade-${grade} ${
        hasConflicts ? 'border-2 border-red-400' : 'border'
      }`}
      title={hasConflicts ? `Conflicts: ${getConflictSummary()}` : undefined}
    >
      <div className="class-name">
        {classId}
      </div>
      {hasConflicts && (
        <div className="conflict-indicator">
          <span className="conflict-dot">
            <span className="conflict-ping" />
            <span className="conflict-dot-static" />
          </span>
        </div>
      )}
    </div>
  );
};

export default ClassCard;