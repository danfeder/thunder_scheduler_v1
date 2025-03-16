#!/usr/bin/env python3
"""
Thunder Scheduler Constraint Solver
This script uses Google OR-Tools to solve the class scheduling problem.
"""

from ortools.sat.python import cp_model
import json
import sys
import time

class ScheduleSolver:
    """Class for solving the scheduling problem using OR-Tools CP-SAT solver."""
    
    def __init__(self, data):
        """Initialize the solver with input data.
        
        Args:
            data: Dictionary containing scheduling input data:
                - classes: List of class objects with id, name, gradeLevel
                - conflicts: Dictionary mapping class IDs to day/period conflicts
                - teacherAvailability: Dictionary mapping days to blocked periods
                - constraints: Dictionary with scheduling constraints
                - startDate: Start date of the schedule
                - endDate: End date of the schedule
                - rotationWeeks: Number of weeks in the rotation
        """
        self.classes = data['classes']
        self.conflicts = data['conflicts']
        self.teacher_availability = data['teacherAvailability']
        self.constraints = data['constraints']
        self.rotation_weeks = data.get('rotationWeeks', 1)
        self.days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        self.periods = list(range(1, 9))  # 8 periods per day
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.assignments = {}
        self.solution_found = False
        
    def build_model(self):
        """Build the constraint model with all variables and constraints."""
        # Create variables
        for class_obj in self.classes:
            class_id = class_obj['id']
            for week in range(1, self.rotation_weeks + 1):
                for day in self.days:
                    for period in self.periods:
                        var_name = f'class_{class_id}_week_{week}_day_{day}_period_{period}'
                        self.assignments[(class_id, week, day, period)] = self.model.NewBoolVar(var_name)
        
        # Add constraints
        self._add_class_conflict_constraints()
        self._add_teacher_availability_constraints()
        self._add_one_class_per_slot_constraints()
        self._add_each_class_once_constraints()
        self._add_max_classes_per_day_constraints()
        self._add_max_classes_per_week_constraints()
        self._add_consecutive_class_constraints()
        
        if self.constraints.get('requireBreakAfterClass', False):
            self._add_break_after_class_constraints()
            
    def _add_class_conflict_constraints(self):
        """Add constraints for class conflicts (when classes can't be scheduled)."""
        for class_obj in self.classes:
            class_id = class_obj['id']
            if class_id in self.conflicts:
                for day, periods in self.conflicts[class_id].items():
                    for period in periods:
                        for week in range(1, self.rotation_weeks + 1):
                            # Class can't be scheduled during conflict periods
                            self.model.Add(self.assignments[(class_id, week, day, period)] == 0)
    
    def _add_teacher_availability_constraints(self):
        """Add constraints for teacher availability."""
        for day, periods in self.teacher_availability.items():
            for period in periods:
                for week in range(1, self.rotation_weeks + 1):
                    # No classes can be scheduled when teacher is unavailable
                    for class_obj in self.classes:
                        class_id = class_obj['id']
                        self.model.Add(self.assignments[(class_id, week, day, period)] == 0)
    
    def _add_one_class_per_slot_constraints(self):
        """Add constraints to ensure only one class per time slot."""
        for week in range(1, self.rotation_weeks + 1):
            for day in self.days:
                for period in self.periods:
                    # Sum of all classes assigned to this slot must be <= 1
                    self.model.Add(sum(
                        self.assignments[(class_obj['id'], week, day, period)]
                        for class_obj in self.classes
                    ) <= 1)
    
    def _add_each_class_once_constraints(self):
        """Add constraints to ensure each class is scheduled exactly once per rotation."""
        for class_obj in self.classes:
            class_id = class_obj['id']
            # Sum of all assignments for this class must be exactly 1
            self.model.Add(sum(
                self.assignments[(class_id, week, day, period)]
                for week in range(1, self.rotation_weeks + 1)
                for day in self.days
                for period in self.periods
            ) == 1)
    
    def _add_max_classes_per_day_constraints(self):
        """Add constraints for maximum classes per day."""
        max_classes_per_day = self.constraints.get('maxClassesPerDay', 4)
        
        for week in range(1, self.rotation_weeks + 1):
            for day in self.days:
                # Sum of all classes on this day must be <= max_classes_per_day
                self.model.Add(sum(
                    self.assignments[(class_obj['id'], week, day, period)]
                    for class_obj in self.classes
                    for period in self.periods
                ) <= max_classes_per_day)
    
    def _add_max_classes_per_week_constraints(self):
        """Add constraints for maximum classes per week."""
        max_classes_per_week = self.constraints.get('maxClassesPerWeek', 16)
        
        for week in range(1, self.rotation_weeks + 1):
            # Sum of all classes in this week must be <= max_classes_per_week
            self.model.Add(sum(
                self.assignments[(class_obj['id'], week, day, period)]
                for class_obj in self.classes
                for day in self.days
                for period in self.periods
            ) <= max_classes_per_week)
    
    def _add_consecutive_class_constraints(self):
        """Add constraints to limit consecutive classes."""
        max_consecutive = self.constraints.get('maxConsecutiveClasses', 2)
        
        for week in range(1, self.rotation_weeks + 1):
            for day in self.days:
                for start_period in range(1, 9 - max_consecutive):
                    # For each possible consecutive sequence of periods
                    consecutive_periods = list(range(start_period, start_period + max_consecutive + 1))
                    # Sum of all classes in these consecutive periods must be <= max_consecutive
                    self.model.Add(sum(
                        self.assignments[(class_obj['id'], week, day, period)]
                        for class_obj in self.classes
                        for period in consecutive_periods
                    ) <= max_consecutive)
    
    def _add_break_after_class_constraints(self):
        """Add constraints to require a break after each class."""
        for week in range(1, self.rotation_weeks + 1):
            for day in self.days:
                for period in range(1, 7):  # Only up to period 7 (since period 8 is the last)
                    for class_obj in self.classes:
                        class_id = class_obj['id']
                        # If a class is scheduled in this period, no class can be scheduled in the next period
                        self.model.Add(
                            self.assignments[(class_id, week, day, period)] + 
                            sum(self.assignments[(other_class['id'], week, day, period + 1)] 
                                for other_class in self.classes) <= 1
                        )
    
    def solve(self, time_limit_seconds=60):
        """Solve the constraint model.
        
        Args:
            time_limit_seconds: Maximum time to spend solving (default: 60 seconds)
            
        Returns:
            Dictionary with solution status and assignments if found
        """
        self.build_model()
        
        # Set time limit
        self.solver.parameters.max_time_in_seconds = time_limit_seconds
        
        start_time = time.time()
        status = self.solver.Solve(self.model)
        solve_time = time.time() - start_time
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            self.solution_found = True
            return self._extract_solution(status, solve_time)
        else:
            return {
                'status': 'infeasible',
                'statusCode': status,
                'message': 'No solution found that satisfies all constraints',
                'solveTime': solve_time
            }
    
    def _extract_solution(self, status, solve_time):
        """Extract the solution from the solver.
        
        Args:
            status: Solver status code
            solve_time: Time taken to solve
            
        Returns:
            Dictionary with solution details
        """
        solution = []
        
        for class_obj in self.classes:
            class_id = class_obj['id']
            for week in range(1, self.rotation_weeks + 1):
                for day in self.days:
                    for period in self.periods:
                        if self.solver.Value(self.assignments[(class_id, week, day, period)]) == 1:
                            solution.append({
                                'classId': class_id,
                                'week': week,
                                'day': day,
                                'period': period
                            })
        
        status_str = 'optimal' if status == cp_model.OPTIMAL else 'feasible'
        
        return {
            'status': 'success',
            'statusCode': status,
            'statusString': status_str,
            'solution': solution,
            'solveTime': solve_time,
            'numClasses': len(self.classes),
            'numAssignments': len(solution)
        }
    
    def validate_solution(self, assignments):
        """Validate if a given solution satisfies all constraints.
        
        Args:
            assignments: List of assignments to validate
            
        Returns:
            Dictionary with validation results
        """
        # Implementation for validating an existing solution
        # This would check all constraints against the provided assignments
        # For now, return a placeholder
        return {
            'valid': True,
            'violations': []
        }


def main():
    """Main function to read input and run solver."""
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    # Create solver
    solver = ScheduleSolver(input_data)
    
    # Solve and get result
    result = solver.solve()
    
    # Output result as JSON
    print(json.dumps(result))


if __name__ == "__main__":
    main()