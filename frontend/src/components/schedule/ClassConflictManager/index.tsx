import React, { useState } from 'react';
import Card from '../../shared/Card';
import ConflictGrid from './ConflictGrid';
import { DayOfWeek } from '../../../types/schedule.types';

interface DailyConflicts {
  day: DayOfWeek;
  periods: number[];
}

interface ClassConflictManagerProps {
  classId: string;
  initialConflicts?: DailyConflicts[];
  onConflictsChange: (conflicts: DailyConflicts[]) => void;
}

const ClassConflictManager: React.FC<ClassConflictManagerProps> = ({
  classId,
  initialConflicts = [],
  onConflictsChange,
}) => {
  const [conflicts, setConflicts] = useState<DailyConflicts[]>(initialConflicts);

  const handleConflictToggle = (day: DayOfWeek, period: number) => {
    setConflicts(prevConflicts => {
      const dayConflicts = prevConflicts.find(c => c.day === day);
      
      if (!dayConflicts) {
        // Add new conflict
        const newConflicts = [...prevConflicts, { day, periods: [period] }];
        onConflictsChange(newConflicts);
        return newConflicts;
      }

      if (dayConflicts.periods.includes(period)) {
        // Remove period from conflicts
        const updatedConflicts = prevConflicts.map(c =>
          c.day === day
            ? { ...c, periods: c.periods.filter(p => p !== period) }
            : c
        ).filter(c => c.periods.length > 0); // Remove empty days
        onConflictsChange(updatedConflicts);
        return updatedConflicts;
      } else {
        // Add period to conflicts
        const updatedConflicts = prevConflicts.map(c =>
          c.day === day
            ? { ...c, periods: [...c.periods, period].sort((a, b) => a - b) }
            : c
        );
        onConflictsChange(updatedConflicts);
        return updatedConflicts;
      }
    });
  };

  return (
    <Card 
      title={`Class Conflicts - ${classId}`}
      className="max-w-4xl mx-auto"
    >
      <div className="p-4">
        <ConflictGrid
          conflicts={conflicts}
          onConflictToggle={handleConflictToggle}
        />
      </div>
    </Card>
  );
};

export default ClassConflictManager;