import { useEffect } from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { useAllSchedules } from './hooks/useScheduleQuery';
import { useAllClasses } from './hooks/useClassQuery';
import { ErrorProvider } from './context/error/ErrorContext';
import { QueryProvider } from './context/QueryProvider';
import ScheduleComponent from './components/schedule';
import PerformanceMonitor from './components/devtools/PerformanceMonitor';
import LoadingSpinner from './components/shared/LoadingSpinner';
import './styles/schedule.css';

function ScheduleContent() {
  const teacherId = 'TEACHER001';
  
  // Fetch available schedules and classes using the proper hooks
  const { data: schedules, isLoading: schedulesLoading, isError: schedulesError } = useAllSchedules();
  const { data: classes, isLoading: classesLoading, isError: classesError } = useAllClasses();
  
 const isLoading = schedulesLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (schedulesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          Error loading schedules
        </div>
      </div>
    )
  }

  if (classesError || !classes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          Error loading classes
        </div>
      </div>
    )
  }


  // Use the first available schedule and class, or undefined if no schedules
  const scheduleId = schedules && schedules.length > 0 ? schedules[0].id : undefined;
  const defaultClassId = classes && classes.length > 0 ? classes[0].id : '';

  return (
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
      
      {/* Performance monitoring tools */}
      <PerformanceMonitor refreshInterval={3000} />
    </div>
  );
}

function App() {
  // Track page load performance
  useEffect(() => {
    if (window.performance) {
      const pageLoadTime = performance.now();
      console.log(`[Performance] Page loaded in ${pageLoadTime.toFixed(2)}ms`);
      
      if (performance.getEntriesByType) {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          console.log('[Performance] Navigation Timing:', {
            domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
            domComplete: navigationTiming.domComplete,
            loadEvent: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
            totalTime: navigationTiming.loadEventEnd
          });
        }
      }
    }
  }, []);

  return (
    <QueryProvider>
      <ErrorProvider>
        <ScheduleProvider>
          <ScheduleContent />
        </ScheduleProvider>
      </ErrorProvider>
    </QueryProvider>
  );
}

export default App;
