#!/usr/bin/env python3
"""
Thunder Scheduler Solution Validator
This script validates if a schedule meets all the required constraints.
"""

import json
import sys


class ScheduleValidator:
    """Class for validating schedules against constraints."""
    
    def __init__(self, data):
        """Initialize the validator with input data.
        
        Args:
            data: Dictionary containing validation input data:
                - assignments: List of class assignments
                - classes: List of class objects with id, name, gradeLevel
                - conflicts: Dictionary mapping class IDs to day/period conflicts
                - teacherAvailability: Dictionary mapping days to blocked periods
                - constraints: Dictionary with scheduling constraints
        """
        self.assignments = data['assignments']
        self.classes = data['classes']
        self.conflicts = data['conflicts']
        self.teacher_availability = data['teacherAvailability']
        self.constraints = data['constraints']
        self.days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        self.periods = list(range(1, 9))  # 8 periods per day
        
    def validate(self):
        """Validate the schedule against all constraints.
        
        Returns:
            Dictionary with validation results
        """
        violations = []
        
        # Check each constraint
        violations.extend(self._validate_class_conflicts())
        violations.extend(self._validate_teacher_availability())
        violations.extend(self._validate_one_class_per_slot())
        violations.extend(self._validate_each_class_once())
        violations.extend(self._validate_max_classes_per_day())
        violations.extend(self._validate_max_classes_per_week())
        violations.extend(self._validate_consecutive_classes())
        
        if self.constraints.get('requireBreakAfterClass', False):
            violations.extend(self._validate_break_after_class())
        
        return {
            'valid': len(violations) == 0,
            'violations': violations,
            'numAssignments': len(self.assignments),
            'numClasses': len(self.classes)
        }
    
    def _validate_class_conflicts(self):
        """Validate that no class is scheduled during its conflict periods."""
        violations = []
        
        for assignment in self.assignments:
            class_id = assignment['classId']
            day = assignment['day']
            period = assignment['period']
            week = assignment.get('week', 1)
            
            if class_id in self.conflicts and day in self.conflicts[class_id]:
                if period in self.conflicts[class_id][day]:
                    violations.append({
                        'type': 'class_conflict',
                        'message': f'Class {class_id} scheduled during conflict period {period} on {day} in week {week}',
                        'assignment': assignment
                    })
        
        return violations
    
    def _validate_teacher_availability(self):
        """Validate that no class is scheduled when teacher is unavailable."""
        violations = []
        
        for assignment in self.assignments:
            day = assignment['day']
            period = assignment['period']
            week = assignment.get('week', 1)
            
            if day in self.teacher_availability and period in self.teacher_availability[day]:
                violations.append({
                    'type': 'teacher_unavailable',
                    'message': f'Class scheduled when teacher is unavailable on {day} period {period} in week {week}',
                    'assignment': assignment
                })
        
        return violations
    
    def _validate_one_class_per_slot(self):
        """Validate that only one class is scheduled per time slot."""
        violations = []
        slot_assignments = {}
        
        for assignment in self.assignments:
            day = assignment['day']
            period = assignment['period']
            week = assignment.get('week', 1)
            slot_key = f"{week}_{day}_{period}"
            
            if slot_key in slot_assignments:
                violations.append({
                    'type': 'multiple_classes_per_slot',
                    'message': f'Multiple classes scheduled on {day} period {period} in week {week}',
                    'assignments': [slot_assignments[slot_key], assignment]
                })
            else:
                slot_assignments[slot_key] = assignment
        
        return violations
    
    def _validate_each_class_once(self):
        """Validate that each class is scheduled exactly once per rotation."""
        violations = []
        class_counts = {class_obj['id']: 0 for class_obj in self.classes}
        
        for assignment in self.assignments:
            class_id = assignment['classId']
            if class_id in class_counts:
                class_counts[class_id] += 1
        
        for class_id, count in class_counts.items():
            if count == 0:
                violations.append({
                    'type': 'class_not_scheduled',
                    'message': f'Class {class_id} not scheduled',
                    'classId': class_id
                })
            elif count > 1:
                violations.append({
                    'type': 'class_scheduled_multiple_times',
                    'message': f'Class {class_id} scheduled {count} times',
                    'classId': class_id,
                    'count': count
                })
        
        return violations
    
    def _validate_max_classes_per_day(self):
        """Validate that the maximum classes per day constraint is met."""
        violations = []
        max_classes_per_day = self.constraints.get('maxClassesPerDay', 4)
        
        # Group assignments by week and day
        day_counts = {}
        for assignment in self.assignments:
            day = assignment['day']
            week = assignment.get('week', 1)
            day_key = f"{week}_{day}"
            
            if day_key not in day_counts:
                day_counts[day_key] = 0
            day_counts[day_key] += 1
        
        # Check if any day exceeds the maximum
        for day_key, count in day_counts.items():
            if count > max_classes_per_day:
                week, day = day_key.split('_')
                violations.append({
                    'type': 'max_classes_per_day_exceeded',
                    'message': f'{count} classes scheduled on {day} in week {week} (max: {max_classes_per_day})',
                    'day': day,
                    'week': week,
                    'count': count,
                    'max': max_classes_per_day
                })
        
        return violations
    
    def _validate_max_classes_per_week(self):
        """Validate that the maximum classes per week constraint is met."""
        violations = []
        max_classes_per_week = self.constraints.get('maxClassesPerWeek', 16)
        
        # Group assignments by week
        week_counts = {}
        for assignment in self.assignments:
            week = assignment.get('week', 1)
            
            if week not in week_counts:
                week_counts[week] = 0
            week_counts[week] += 1
        
        # Check if any week exceeds the maximum
        for week, count in week_counts.items():
            if count > max_classes_per_week:
                violations.append({
                    'type': 'max_classes_per_week_exceeded',
                    'message': f'{count} classes scheduled in week {week} (max: {max_classes_per_week})',
                    'week': week,
                    'count': count,
                    'max': max_classes_per_week
                })
        
        return violations
    
    def _validate_consecutive_classes(self):
        """Validate that the consecutive classes constraint is met."""
        violations = []
        max_consecutive = self.constraints.get('maxConsecutiveClasses', 2)
        
        # Group assignments by week and day
        day_assignments = {}
        for assignment in self.assignments:
            day = assignment['day']
            week = assignment.get('week', 1)
            period = assignment['period']
            day_key = f"{week}_{day}"
            
            if day_key not in day_assignments:
                day_assignments[day_key] = []
            day_assignments[day_key].append(period)
        
        # Check for consecutive classes
        for day_key, periods in day_assignments.items():
            periods.sort()
            consecutive_count = 1
            
            for i in range(1, len(periods)):
                if periods[i] == periods[i-1] + 1:
                    consecutive_count += 1
                    if consecutive_count > max_consecutive:
                        week, day = day_key.split('_')
                        violations.append({
                            'type': 'max_consecutive_classes_exceeded',
                            'message': f'{consecutive_count} consecutive classes scheduled on {day} in week {week} (max: {max_consecutive})',
                            'day': day,
                            'week': week,
                            'periods': periods[i-consecutive_count+1:i+1],
                            'max': max_consecutive
                        })
                        break
                else:
                    consecutive_count = 1
        
        return violations
    
    def _validate_break_after_class(self):
        """Validate that there is a break after each class if required."""
        violations = []
        
        # Group assignments by week and day
        day_assignments = {}
        for assignment in self.assignments:
            day = assignment['day']
            week = assignment.get('week', 1)
            period = assignment['period']
            day_key = f"{week}_{day}"
            
            if day_key not in day_assignments:
                day_assignments[day_key] = []
            day_assignments[day_key].append(period)
        
        # Check for classes without breaks
        for day_key, periods in day_assignments.items():
            periods.sort()
            
            for i in range(len(periods) - 1):
                if periods[i+1] == periods[i] + 1:
                    week, day = day_key.split('_')
                    violations.append({
                        'type': 'no_break_after_class',
                        'message': f'No break after class on {day} period {periods[i]} in week {week}',
                        'day': day,
                        'week': week,
                        'period': periods[i]
                    })
        
        return violations


def main():
    """Main function to read input and run validator."""
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    # Create validator
    validator = ScheduleValidator(input_data)
    
    # Validate and get result
    result = validator.validate()
    
    # Output result as JSON
    print(json.dumps(result))


if __name__ == "__main__":
    main()