import { useState } from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import ScheduleComponent from './components/schedule';
import './styles/schedule.css';

function App() {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();

  // Temporary mock data for development
  const mockSchedule = {
    id: '1',
    startDate: '2025-03-17',
    endDate: '2025-06-17',
    rotationWeeks: 2,
    assignments: [
      { classId: '1', day: 'Monday' as const, period: 1, week: 1 },
      { classId: '2', day: 'Tuesday' as const, period: 2, week: 1 },
      { classId: '3', day: 'Wednesday' as const, period: 3, week: 1 },
    ],
    periods: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      startTime: `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      endTime: `${8 + Math.floor((i + 1) / 2)}:${i % 2 === 0 ? '30' : '00'}`,
    })),
  };

  const mockConflicts = [
    {
      classId: '1',
      day: 'Monday' as const,
      period: 1,
      type: 'teacher' as const,
      message: 'Teacher unavailable',
    },
    {
      classId: '2',
      day: 'Tuesday' as const,
      period: 2,
      type: 'class' as const,
      message: 'Class conflict',
    },
  ];

  const mockClassGrades = {
    '1': 5,
    '2': 4,
    '3': 3,
  };

  const handleClassConflictsChange = (
    classId: string,
    conflicts: { day: string; periods: number[] }[]
  ) => {
    console.log('Class conflicts updated:', { classId, conflicts });
  };

  const handleInstructorAvailabilityChange = (
    teacherId: string,
    blockedPeriods: { date: string; period: number }[]
  ) => {
    console.log('Instructor availability updated:', { teacherId, blockedPeriods });
  };

  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Thunder Scheduler</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and schedule classes efficiently
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScheduleComponent
              schedule={mockSchedule}
              conflicts={mockConflicts}
              classGrades={mockClassGrades}
              onClassConflictsChange={handleClassConflictsChange}
              onInstructorAvailabilityChange={handleInstructorAvailabilityChange}
            />
          </div>
        </main>
      </div>
    </ScheduleProvider>
  );
}

export default App;
