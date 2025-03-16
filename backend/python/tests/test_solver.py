#!/usr/bin/env python3
"""
Test script for the Thunder Scheduler Constraint Solver
"""

import sys
import os
import json

# Add the parent directory to the path so we can import the solver modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from solver.constraint_solver import ScheduleSolver
from solver.solution_validator import ScheduleValidator


def create_test_data():
    """Create a small test dataset for the solver."""
    return {
        'classes': [
            {'id': 'class1', 'name': 'Class 1A', 'gradeLevel': 1},
            {'id': 'class2', 'name': 'Class 1B', 'gradeLevel': 1},
            {'id': 'class3', 'name': 'Class 2A', 'gradeLevel': 2},
            {'id': 'class4', 'name': 'Class 2B', 'gradeLevel': 2},
        ],
        'conflicts': {
            'class1': {
                'MONDAY': [1, 2, 3],
                'TUESDAY': [6, 7],
                'WEDNESDAY': [4, 5],
                'THURSDAY': [2, 3],
                'FRIDAY': [7, 8]
            },
            'class2': {
                'MONDAY': [4, 5, 6],
                'TUESDAY': [1, 2],
                'WEDNESDAY': [6, 7],
                'THURSDAY': [4, 5],
                'FRIDAY': [1, 2]
            },
            'class3': {
                'MONDAY': [7, 8],
                'TUESDAY': [3, 4, 5],
                'WEDNESDAY': [2, 3],
                'THURSDAY': [6, 7, 8],
                'FRIDAY': [3, 4]
            },
            'class4': {
                'MONDAY': [2, 3],
                'TUESDAY': [7, 8],
                'WEDNESDAY': [1, 2, 3],
                'THURSDAY': [4, 5],
                'FRIDAY': [6, 7]
            }
        },
        'teacherAvailability': {
            'MONDAY': [1, 8],  # Teacher unavailable during periods 1 and 8 on Monday
            'FRIDAY': [7, 8]   # Teacher unavailable during periods 7 and 8 on Friday
        },
        'constraints': {
            'maxClassesPerDay': 3,
            'maxClassesPerWeek': 12,
            'maxConsecutiveClasses': 2,
            'requireBreakAfterClass': True
        },
        'rotationWeeks': 1
    }


def test_solver():
    """Test the constraint solver with a small dataset."""
    print("Testing constraint solver...")
    
    # Create test data
    test_data = create_test_data()
    
    # Create solver
    solver = ScheduleSolver(test_data)
    
    # Solve and get result
    result = solver.solve()
    
    # Print result
    print(f"Solver status: {result['status']}")
    print(f"Solve time: {result['solveTime']:.2f} seconds")
    
    if result['status'] == 'success':
        print(f"Found {len(result['solution'])} assignments")
        
        # Print assignments in a readable format
        assignments_by_day = {}
        for assignment in result['solution']:
            day = assignment['day']
            if day not in assignments_by_day:
                assignments_by_day[day] = []
            assignments_by_day[day].append(assignment)
        
        for day in ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']:
            if day in assignments_by_day:
                print(f"\n{day}:")
                day_assignments = sorted(assignments_by_day[day], key=lambda a: a['period'])
                for assignment in day_assignments:
                    class_id = assignment['classId']
                    period = assignment['period']
                    class_name = next((c['name'] for c in test_data['classes'] if c['id'] == class_id), class_id)
                    print(f"  Period {period}: {class_name}")
        
        # Validate the solution
        validator = ScheduleValidator({
            'assignments': result['solution'],
            'classes': test_data['classes'],
            'conflicts': test_data['conflicts'],
            'teacherAvailability': test_data['teacherAvailability'],
            'constraints': test_data['constraints']
        })
        validation_result = validator.validate()
        
        print(f"\nValidation result: {'Valid' if validation_result['valid'] else 'Invalid'}")
        if not validation_result['valid']:
            print(f"Violations: {len(validation_result['violations'])}")
            for violation in validation_result['violations']:
                print(f"  - {violation['message']}")
    else:
        print(f"No solution found: {result['message']}")


if __name__ == "__main__":
    test_solver()