import { ScheduleProvider } from './context/ScheduleContext';
import ScheduleDisplay from './components/schedule/ScheduleDisplay';
import ClassList from './components/schedule/ClassList';
import Card from './components/shared/Card';
import Button from './components/shared/Button';
import { useState } from 'react';

function App() {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();

  // Temporary mock data for development
  const mockClasses = [
    { id: '1', name: 'Math 101', gradeLevel: 5, conflicts: [] },
    { id: '2', name: 'Science 101', gradeLevel: 5, conflicts: [] },
    { id: '3', name: 'English 101', gradeLevel: 5, conflicts: [] },
  ];

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
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Schedule Actions */}
            <div className="px-4 sm:px-0 mb-6">
              <Card>
                <div className="flex justify-between items-center">
                  <div className="space-x-4">
                    <Button variant="primary">Create New Schedule</Button>
                    <Button variant="secondary">Import Schedule</Button>
                  </div>
                  <Button variant="secondary">Export Schedule</Button>
                </div>
              </Card>
            </div>

            {/* Grid Layout */}
            <div className="px-4 sm:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Class List - 1/4 width on large screens */}
                <div className="lg:col-span-1">
                  <ClassList
                    classes={mockClasses}
                    isLoading={false}
                    onClassSelect={setSelectedClassId}
                    selectedClassId={selectedClassId}
                  />
                </div>

                {/* Schedule Display - 3/4 width on large screens */}
                <div className="lg:col-span-3">
                  <ScheduleDisplay />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ScheduleProvider>
  );
}

export default App;
