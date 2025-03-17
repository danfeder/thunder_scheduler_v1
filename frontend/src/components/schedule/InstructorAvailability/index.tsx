import React, { useState } from 'react';
import Card from '../../shared/Card';
import WeekNavigation from './WeekNavigation';
import AvailabilityCalendar from './AvailabilityCalendar';

interface TeacherAvailability {
  date: string;
  period: number;
}

interface InstructorAvailabilityProps {
  teacherId: string;
  initialBlockedPeriods?: TeacherAvailability[];
  onAvailabilityChange: (blockedPeriods: TeacherAvailability[]) => void;
}

const InstructorAvailability: React.FC<InstructorAvailabilityProps> = ({
  teacherId,
  initialBlockedPeriods = [],
  onAvailabilityChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedPeriods, setBlockedPeriods] = useState<TeacherAvailability[]>(
    initialBlockedPeriods
  );

  const handleWeekChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleAvailabilityChange = (date: string, period: number) => {
    setBlockedPeriods(prevBlocked => {
      const existingBlock = prevBlocked.find(
        block => block.date === date && block.period === period
      );

      let newBlocked;
      if (existingBlock) {
        // Remove the blocked period
        newBlocked = prevBlocked.filter(
          block => !(block.date === date && block.period === period)
        );
      } else {
        // Add new blocked period
        newBlocked = [...prevBlocked, { date, period }];
      }

      // Sort by date and period
      newBlocked.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.period - b.period;
      });

      onAvailabilityChange(newBlocked);
      return newBlocked;
    });
  };

  return (
    <Card 
      title={`Instructor Availability - ${teacherId}`}
      className="max-w-4xl mx-auto"
    >
      <div className="p-4">
        <WeekNavigation
          currentDate={currentDate}
          onWeekChange={handleWeekChange}
        />
        <AvailabilityCalendar
          startDate={currentDate}
          blockedPeriods={blockedPeriods}
          onAvailabilityChange={handleAvailabilityChange}
        />
      </div>
    </Card>
  );
};

export default InstructorAvailability;