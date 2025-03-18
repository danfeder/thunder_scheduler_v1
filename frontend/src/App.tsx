import { useState } from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { ErrorProvider } from './context/error/ErrorContext';
import { QueryProvider } from './context/QueryProvider';
import ScheduleComponent from './components/schedule';
import './styles/schedule.css';

function App() {
  // Default schedule ID - in a real app, this might come from a route parameter
  const scheduleId = '1';
  const teacherId = 'TEACHER001';
  const defaultClassId = '1';

  return (
    <ErrorProvider>
      <QueryProvider>
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
                  scheduleId={scheduleId}
                  teacherId={teacherId}
                  defaultClassId={defaultClassId}
                />
              </div>
            </main>
          </div>
        </ScheduleProvider>
      </QueryProvider>
    </ErrorProvider>
  );
}

export default App;
