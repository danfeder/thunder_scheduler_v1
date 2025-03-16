#!/usr/bin/env python3
"""
Test script for the Thunder Scheduler Constraint Solver

This script tests the constraint solver with different constraint configurations
to ensure it works correctly with various settings.
"""

import sys
import os
import json
import time
import csv
from typing import Dict, List, Any

# Add the parent directory to the path so we can import the solver modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from solver.constraint_solver import ScheduleSolver
from solver.solution_validator import ScheduleValidator


def create_test_data(constraints=None, rotation_weeks=1):
    """Create a small test dataset for the solver.
    
    Args:
        constraints: Optional dictionary with constraint settings
        rotation_weeks: Number of weeks in the rotation
        
    Returns:
        Dictionary with test data
    """
    # Default constraints
    default_constraints = {
        'maxClassesPerDay': 3,
        'maxClassesPerWeek': 12,
        'maxConsecutiveClasses': 2,
        'requireBreakAfterClass': True
    }
    
    # Use provided constraints or defaults
    if constraints:
        # Start with defaults and update with provided constraints
        actual_constraints = default_constraints.copy()
        actual_constraints.update(constraints)
    else:
        actual_constraints = default_constraints
    
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
        'constraints': actual_constraints,
        'rotationWeeks': rotation_weeks
    }


def load_csv_test_data(csv_file, num_classes=None, constraints=None, rotation_weeks=1):
    """Load test data from a CSV file.
    
    Args:
        csv_file: Path to the CSV file
        num_classes: Optional limit on number of classes to load
        constraints: Optional dictionary with constraint settings
        rotation_weeks: Number of weeks in the rotation
        
    Returns:
        Dictionary with test data
    """
    # Default constraints
    default_constraints = {
        'maxClassesPerDay': 4,
        'maxClassesPerWeek': 16,
        'maxConsecutiveClasses': 2,
        'requireBreakAfterClass': False
    }
    
    # Use provided constraints or defaults
    if constraints:
        # Start with defaults and update with provided constraints
        actual_constraints = default_constraints.copy()
        actual_constraints.update(constraints)
    else:
        actual_constraints = default_constraints
    
    classes = []
    conflicts = {}
    days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    
    with open(csv_file, 'r') as f:
        reader = csv.reader(f)
        headers = next(reader)  # Skip header row
        
        for i, row in enumerate(reader):
            if not row or not row[0]:  # Skip empty rows
                continue
                
            if num_classes and i >= num_classes:
                break
                
            class_name = row[0]
            class_id = f"class{i+1}"
            classes.append({
                'id': class_id,
                'name': class_name,
                'gradeLevel': int(class_name.split('-')[0].split(',')[0].replace('K', '0').replace('PK', '0')) if '-' in class_name else 1
            })
            
            conflicts[class_id] = {}
            
            # Parse conflict periods for each day
            for day_idx, day_conflicts in enumerate(row[1:6], 0):
                day = days[day_idx]
                if day_conflicts:
                    # Handle different formats (comma or semicolon separated)
                    if ';' in day_conflicts:
                        periods = [int(p.strip()) for p in day_conflicts.split(';')]
                    elif ',' in day_conflicts:
                        periods = [int(p.strip()) for p in day_conflicts.split(',')]
                    else:
                        periods = [int(day_conflicts.strip())]
                        
                    conflicts[class_id][day] = periods
    
    # Create default teacher availability (no restrictions)
    teacher_availability = {}
    
    return {
        'classes': classes,
        'conflicts': conflicts,
        'teacherAvailability': teacher_availability,
        'constraints': actual_constraints,
        'rotationWeeks': rotation_weeks
    }


def print_schedule(result, test_data):
    """Print the schedule in a readable format.
    
    Args:
        result: Solver result
        test_data: Test data used for solving
    """
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
                    week = assignment.get('week', 1)
                    class_name = next((c['name'] for c in test_data['classes'] if c['id'] == class_id), class_id)
                    print(f"  Week {week}, Period {period}: {class_name}")
    else:
        print(f"No solution found: {result.get('message', 'Unknown error')}")


def validate_solution(result, test_data):
    """Validate the solution against all constraints.
    
    Args:
        result: Solver result
        test_data: Test data used for solving
        
    Returns:
        Validation result
    """
    if result['status'] != 'success':
        return None
        
    validator = ScheduleValidator({
        'assignments': result['solution'],
        'classes': test_data['classes'],
        'conflicts': test_data['conflicts'],
        'teacherAvailability': test_data['teacherAvailability'],
        'constraints': test_data['constraints']
    })
    
    return validator.validate()


def test_basic_solver():
    """Test the constraint solver with default settings."""
    print("\n=== Testing Basic Solver ===")
    
    # Create test data with default settings
    test_data = create_test_data()
    
    # Create solver
    solver = ScheduleSolver(test_data)
    
    # Solve and get result
    start_time = time.time()
    result = solver.solve()
    solve_time = time.time() - start_time
    
    # Print result
    print(f"Solver status: {result['status']}")
    print(f"Solve time: {solve_time:.2f} seconds")
    
    # Print schedule
    print_schedule(result, test_data)
    
    # Validate solution
    validation_result = validate_solution(result, test_data)
    
    if validation_result:
        print(f"\nValidation result: {'Valid' if validation_result['valid'] else 'Invalid'}")
        if not validation_result['valid']:
            print(f"Violations: {len(validation_result['violations'])}")
            for violation in validation_result['violations']:
                print(f"  - {violation['message']}")
    
    return result['status'] == 'success'


def test_max_classes_per_day():
    """Test the solver with different max classes per day settings."""
    print("\n=== Testing Max Classes Per Day ===")
    
    for max_classes in [2, 3, 4]:
        print(f"\nTesting with maxClassesPerDay = {max_classes}")
        
        # Create test data with specific max classes per day
        test_data = create_test_data(constraints={'maxClassesPerDay': max_classes})
        
        # Create solver
        solver = ScheduleSolver(test_data)
        
        # Solve and get result
        start_time = time.time()
        result = solver.solve()
        solve_time = time.time() - start_time
        
        # Print result
        print(f"Solver status: {result['status']}")
        print(f"Solve time: {solve_time:.2f} seconds")
        
        # Validate solution
        validation_result = validate_solution(result, test_data)
        
        if validation_result:
            print(f"Validation result: {'Valid' if validation_result['valid'] else 'Invalid'}")
            
            # Check if max classes per day constraint is satisfied
            if result['status'] == 'success':
                # Count classes per day
                classes_per_day = {}
                for assignment in result['solution']:
                    day = assignment['day']
                    week = assignment.get('week', 1)
                    day_key = f"{week}_{day}"
                    
                    if day_key not in classes_per_day:
                        classes_per_day[day_key] = 0
                    classes_per_day[day_key] += 1
                
                # Check if any day exceeds the maximum
                constraint_satisfied = all(count <= max_classes for count in classes_per_day.values())
                print(f"Max classes per day constraint satisfied: {constraint_satisfied}")
                
                if not constraint_satisfied:
                    print("Classes per day counts:")
                    for day_key, count in classes_per_day.items():
                        print(f"  {day_key}: {count}")


def test_max_consecutive_classes():
    """Test the solver with different max consecutive classes settings."""
    print("\n=== Testing Max Consecutive Classes ===")
    
    for max_consecutive in [1, 2, 3]:
        print(f"\nTesting with maxConsecutiveClasses = {max_consecutive}")
        
        # Create test data with specific max consecutive classes
        test_data = create_test_data(constraints={'maxConsecutiveClasses': max_consecutive})
        
        # Create solver
        solver = ScheduleSolver(test_data)
        
        # Solve and get result
        start_time = time.time()
        result = solver.solve()
        solve_time = time.time() - start_time
        
        # Print result
        print(f"Solver status: {result['status']}")
        print(f"Solve time: {solve_time:.2f} seconds")
        
        # Validate solution
        validation_result = validate_solution(result, test_data)
        
        if validation_result:
            print(f"Validation result: {'Valid' if validation_result['valid'] else 'Invalid'}")


def test_break_after_class():
    """Test the solver with and without the break after class requirement."""
    print("\n=== Testing Break After Class ===")
    
    for require_break in [True, False]:
        print(f"\nTesting with requireBreakAfterClass = {require_break}")
        
        # Create test data with specific break after class setting
        test_data = create_test_data(constraints={'requireBreakAfterClass': require_break})
        
        # Create solver
        solver = ScheduleSolver(test_data)
        
        # Solve and get result
        start_time = time.time()
        result = solver.solve()
        solve_time = time.time() - start_time
        
        # Print result
        print(f"Solver status: {result['status']}")
        print(f"Solve time: {solve_time:.2f} seconds")
        
        # Validate solution
        validation_result = validate_solution(result, test_data)
        
        if validation_result:
            print(f"Validation result: {'Valid' if validation_result['valid'] else 'Invalid'}")


def test_rotation_weeks():
    """Test the solver with different rotation week settings."""
    print("\n=== Testing Rotation Weeks ===")
    
    for weeks in [1, 2, 3]:
        print(f"\nTesting with rotationWeeks = {weeks}")
        
        # Create test data with specific rotation weeks
        test_data = create_test_data(rotation_weeks=weeks)
        
        # Create solver
        solver = ScheduleSolver(test_data)
        
        # Solve and get result
        start_time = time.time()
        result = solver.solve()
        solve_time = time.time() - start_time
        
        # Print result
        print(f"Solver status: {result['status']}")
        print(f"Solve time: {solve_time:.2f} seconds")
        
        # Validate solution
        validation_result = validate_solution(result, test_data)
        
        if validation_result:
            print(f"Validation result: {'Valid' if validation_result['valid'] else 'Invalid'}")


def test_with_csv_data():
    """Test the solver with data loaded from CSV files."""
    print("\n=== Testing with CSV Data ===")
    
    # Test with small dataset
    small_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                            'test_data', 'small-test-data.csv')
    
    if os.path.exists(small_csv):
        print("\nTesting with small-test-data.csv")
        test_data = load_csv_test_data(small_csv)
        
        # Create solver
        solver = ScheduleSolver(test_data)
        
        # Solve and get result
        start_time = time.time()
        result = solver.solve()
        solve_time = time.time() - start_time
        
        # Print result
        print(f"Solver status: {result['status']}")
        print(f"Solve time: {solve_time:.2f} seconds")
        print(f"Classes: {len(test_data['classes'])}")
        print(f"Assignments: {len(result['solution']) if result['status'] == 'success' else 0}")
        
        # Validate solution
        validation_result = validate_solution(result, test_data)
        
        if validation_result:
            print(f"Validation result: {'Valid' if validation_result['valid'] else 'Invalid'}")
    else:
        print(f"Small CSV file not found: {small_csv}")
    
    # Test with medium dataset
    medium_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                             'test_data', 'medium-test-data.csv')
    
    if os.path.exists(medium_csv):
        print("\nTesting with medium-test-data.csv")
        test_data = load_csv_test_data(medium_csv)
        
        # Create solver
        solver = ScheduleSolver(test_data)
        
        # Solve and get result
        start_time = time.time()
        result = solver.solve(time_limit_seconds=120)  # Increase time limit for larger dataset
        solve_time = time.time() - start_time
        
        # Print result
        print(f"Solver status: {result['status']}")
        print(f"Solve time: {solve_time:.2f} seconds")
        print(f"Classes: {len(test_data['classes'])}")
        print(f"Assignments: {len(result['solution']) if result['status'] == 'success' else 0}")
        
        # Validate solution
        validation_result = validate_solution(result, test_data)
        
        if validation_result:
            print(f"Validation result: {'Valid' if validation_result['valid'] else 'Invalid'}")
    else:
        print(f"Medium CSV file not found: {medium_csv}")


def run_all_tests():
    """Run all tests."""
    test_basic_solver()
    test_max_classes_per_day()
    test_max_consecutive_classes()
    test_break_after_class()
    test_rotation_weeks()
    test_with_csv_data()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test the Thunder Scheduler constraint solver')
    parser.add_argument('--test', choices=['basic', 'max_per_day', 'max_consecutive', 'break', 'rotation', 'csv', 'all'],
                        default='all', help='Which test to run')
    
    args = parser.parse_args()
    
    if args.test == 'basic':
        test_basic_solver()
    elif args.test == 'max_per_day':
        test_max_classes_per_day()
    elif args.test == 'max_consecutive':
        test_max_consecutive_classes()
    elif args.test == 'break':
        test_break_after_class()
    elif args.test == 'rotation':
        test_rotation_weeks()
    elif args.test == 'csv':
        test_with_csv_data()
    else:
        run_all_tests()