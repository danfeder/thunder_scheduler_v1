#!/bin/bash
# Run pytest tests for the Thunder Scheduler constraint solver

# Set the path to the Python executable
PYTHON_PATH=${PYTHON_PATH:-python3}

echo "Running Thunder Scheduler constraint solver tests with pytest..."

# Run all tests
echo "Running all tests..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py -v

# Run only fast tests (skip slow tests)
echo -e "\nRunning fast tests only (skipping slow tests)..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py -v -m "not slow"

# Run constraint configuration tests
echo -e "\nRunning constraint configuration tests..."

echo -e "\n1. Basic solver test..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_basic_solver -v

echo -e "\n2. Max classes per day tests..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_max_classes_per_day -v

echo -e "\n3. Max consecutive classes tests..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_max_consecutive_classes -v

echo -e "\n4. Break after class tests..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_break_after_class -v

echo -e "\n5. Rotation weeks tests..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_rotation_weeks -v

# Run dataset tests
echo -e "\nRunning dataset tests..."

echo -e "\n1. Small dataset test..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_small_csv_data -v

echo -e "\n2. Medium dataset test..."
$PYTHON_PATH -m pytest tests/test_solver_pytest.py::test_medium_csv_data -v

echo -e "\nAll tests completed."