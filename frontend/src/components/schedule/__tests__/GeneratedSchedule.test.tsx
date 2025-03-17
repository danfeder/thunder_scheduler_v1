import React from 'react';
import { render, screen } from '@testing-library/react';
import ScheduleCalendar from '../GeneratedSchedule/ScheduleCalendar';
import { format, startOfWeek } from 'date-fns';

describe('ScheduleCalendar', () => {
  const mockClassGrades = {
    'MATH101': 5,
    'SCI101': 4,
    'ENG101': 3
  };

  const mockAssignments = [
    {
      classId: 'MATH101',
      day: 'Monday' as const,
      period: 1,
      week: 1
    },
    {
      classId: 'SCI101',
      day: 'Tuesday' as const,
      period: 2,
      week: 1
    }
  ];

  const mockConflicts = [
    {
      classId: 'MATH101',
      day: 'Monday' as const,
      period: 1,
      type: 'teacher' as const,
      message: 'Teacher unavailable'
    }
  ];

  it('renders schedule with correct date headers', () => {
    render(
      <ScheduleCalendar
        assignments={mockAssignments}
        conflicts={mockConflicts}
        currentWeek={1}
        classGrades={mockClassGrades}
      />
    );

    // Get Monday's date of current week for comparison
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const mondayStr = format(monday, 'MMM d');
    
    expect(screen.getByText(mondayStr)).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
  });

  it('displays assignments in correct cells', () => {
    render(
      <ScheduleCalendar
        assignments={mockAssignments}
        conflicts={mockConflicts}
        currentWeek={1}
        classGrades={mockClassGrades}
      />
    );

    // Check if class IDs are displayed
    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.getByText('SCI101')).toBeInTheDocument();
  });

  it('shows conflicts correctly', () => {
    render(
      <ScheduleCalendar
        assignments={mockAssignments}
        conflicts={mockConflicts}
        currentWeek={1}
        classGrades={mockClassGrades}
      />
    );

    // Check if conflict indicator is present
    const mathCell = screen.getByText('MATH101').closest('.class-card');
    expect(mathCell).toHaveClass('border-red-400');
  });

  it('filters assignments by grade level', () => {
    render(
      <ScheduleCalendar
        assignments={mockAssignments}
        conflicts={mockConflicts}
        currentWeek={1}
        selectedGrade={5}
        classGrades={mockClassGrades}
      />
    );

    // Should only show grade 5 classes (MATH101)
    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.queryByText('SCI101')).not.toBeInTheDocument();
  });

  it('maintains grid layout with all time periods', () => {
    render(
      <ScheduleCalendar
        assignments={mockAssignments}
        conflicts={mockConflicts}
        currentWeek={1}
        classGrades={mockClassGrades}
      />
    );

    // Check all 8 periods are present
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Period ${i}`)).toBeInTheDocument();
    }

    // Check all weekdays are present
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });
});