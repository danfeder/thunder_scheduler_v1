import React, { useState } from 'react';
import ClassManager from './ClassManager';
import ClassConflictManager from './ClassConflictManager';
import InstructorAvailability from './InstructorAvailability';
import GeneratedSchedule from './GeneratedSchedule';
import { Schedule, Conflict } from '../../types/schedule.types';

// Import all component-specific styles
import '../../styles/components/conflict-grid.css';
import '../../styles/components/availability-calendar.css';
import '../../styles/components/schedule-calendar.css';

interface ScheduleComponentProps {
  schedule: Schedule;
  conflicts: Conflict[];
  classGrades: Record<string, number>;
  onClassConflictsChange: (classId: string, conflicts: { day: string; periods: number[] }[]) => void;
  onInstructorAvailabilityChange: (teacherId: string, blockedPeriods: { date: string; period: number }[]) => void;
}

const ScheduleComponent: React.FC<ScheduleComponentProps> = ({
  schedule,
  conflicts,
  classGrades,
  onClassConflictsChange,
  onInstructorAvailabilityChange,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>();

  // Mock data for ClassManager
  const mockClasses = [
    { id: '1', name: 'Math 101', grade: 5, teacherId: 'TEACHER001' },
    { id: '2', name: 'Science 101', grade: 4, teacherId: 'TEACHER002' },
    { id: '3', name: 'English 101', grade: 3, teacherId: 'TEACHER003' },
  ];

  return (
    <div className="schedule-layout">
      {/* Class Manager - Full width at top */}
      <ClassManager
        classes={mockClasses}
        onClassSelect={setSelectedClassId}
        onClassAdd={(classData) => console.log('Add class:', classData)}
        onClassUpdate={(id, updates) => console.log('Update class:', id, updates)}
        onClassDelete={(id) => console.log('Delete class:', id)}
      />

      {/* Two-column grid for management tools */}
      <div className="management-grid">
        {/* Class Conflicts - Left column */}
        <ClassConflictManager
          classId={selectedClassId || 'MATH101'}
          onConflictsChange={(conflicts) => 
            onClassConflictsChange(selectedClassId || 'MATH101', conflicts)
          }
        />
        
        {/* Instructor Availability - Right column */}
        <InstructorAvailability
          teacherId="TEACHER001"
          onAvailabilityChange={(blockedPeriods) => 
            onInstructorAvailabilityChange('TEACHER001', blockedPeriods)
          }
        />
      </div>

      {/* Generated Schedule - Full width at bottom */}
      <GeneratedSchedule
        schedule={schedule}
        conflicts={conflicts}
        classGrades={classGrades}
      />
    </div>
  );
};

export default ScheduleComponent;

// Re-export components for individual use
export { 
  ClassManager,
  ClassConflictManager,
  InstructorAvailability,
  GeneratedSchedule
};