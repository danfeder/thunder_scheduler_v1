import React, { useState, useEffect } from 'react';
import ClassManager from './ClassManager';
import ClassConflictManagerContainer from './ClassConflictManager/ClassConflictManagerContainer';
import InstructorAvailabilityContainer from './InstructorAvailability/InstructorAvailabilityContainer';
import GeneratedScheduleContainer from './GeneratedSchedule/GeneratedScheduleContainer';
import { useAllClasses } from '../../hooks/useClassQuery';
import LoadingSpinner from '../shared/LoadingSpinner';

// Import all component-specific styles
import '../../styles/components/conflict-grid.css';
import '../../styles/components/availability-calendar.css';
import '../../styles/components/schedule-calendar.css';

interface ScheduleComponentProps {
  scheduleId?: string;
  teacherId: string;
  defaultClassId: string;
}

const ScheduleComponent: React.FC<ScheduleComponentProps> = ({
  scheduleId,
  teacherId,
  defaultClassId
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  
  // Fetch classes from API
  const { data: classes, isLoading, isError } = useAllClasses();
  
  // Set selected class ID when classes are loaded
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="medium" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-red-600 p-4">
        Error loading classes. Please try again later.
      </div>
    );
  }

  // Format classes for ClassManager (if any exist)
  const formattedClasses = (classes || []).map(c => ({
    id: c.id,
    name: c.name,
    grade: c.gradeLevel,
    teacherId: teacherId // Assuming all classes are assigned to the current teacher
  }));

  return (
    <div className="schedule-layout">
      {/* Class Manager - Full width at top */}
      <ClassManager
        classes={formattedClasses}
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