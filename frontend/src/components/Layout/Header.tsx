import { useScheduler } from '@/contexts/SchedulerContext';

export function Header() {
  const { maxClassesPerDay, maxClassesPerWeek } = useScheduler();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              Thunder Scheduler
            </h1>
            <span className="ml-4 text-sm text-gray-500">
              Cooking Class Scheduler
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Classes per day:</span>
              <span className="ml-2">{maxClassesPerDay}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Classes per week:</span>
              <span className="ml-2">{maxClassesPerWeek}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}