import React, { useState } from 'react';
import ClassManager from './ClassManager';
import ClassConflictManagerContainer from './ClassConflictManager/ClassConflictManagerContainer';
import InstructorAvailabilityContainer from './InstructorAvailability/InstructorAvailabilityContainer';
import GeneratedScheduleContainer from './GeneratedSchedule/GeneratedScheduleContainer';

// Import all component-specific styles
import '../../styles/components/conflict-grid.css';
import '../../styles/components/availability-calendar.css';
import '../../styles/components/schedule-calendar.css';

interface ScheduleComponentProps {
  scheduleId: string;
  teacherId: string;
  defaultClassId: string;
}

const ScheduleComponent: React.FC<ScheduleComponentProps> = ({
  scheduleId,
  teacherId,
  defaultClassId
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);

  // Mock data for ClassManager - this will be replaced with real API data in the future
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
        <ClassConflictManagerContainer
          classId={selectedClassId}
        />
        
        {/* Instructor Availability - Right column */}
        <InstructorAvailabilityContainer
          teacherId={teacherId}
        />
      </div>

      {/* Generated Schedule - Full width at bottom */}
      <GeneratedScheduleContainer
        scheduleId={scheduleId}
      />
    </div>
  );
};

export default ScheduleComponent;

// Re-export components for individual use
export {
  ClassManager,
  ClassConflictManagerContainer,
  InstructorAvailabilityContainer,
  GeneratedScheduleContainer
};