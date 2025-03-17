# Thunder Scheduler: CSV Import/Export Phase

## Project Context
I'm working on the Thunder Scheduler project, a cooking class scheduler application that helps organize classes for 33 elementary school classes around existing schedule constraints. The project uses a constraint satisfaction approach with Google OR-Tools.

## Current Progress
We've completed several phases of the project:
- Project setup with Node.js/Express backend and React frontend
- PostgreSQL database with Prisma ORM
- Basic project structure and API endpoints
- Docker configuration for local development
- OR-Tools integration with Python solver
- Basic Constraint Model with comprehensive testing

All code is in the GitHub repository: https://github.com/danfeder/thunder_scheduler_v1
We're currently on the `feature/or-tools-integration` branch.

## Next Task: CSV Import/Export
According to our progress tracker (docs/progress-tracker.md), we've completed Phase 1, Step 4: Basic Constraint Model and are now moving to Phase 1, Step 5: CSV Import/Export. This involves:
- File parsing
- Data validation
- Error handling

## Key Documentation
Please refer to these files for detailed context:
- docs/project-brief.md: Contains the full project requirements
- docs/implementation-plan.md: Details the technical approach and architecture
- docs/progress-tracker.md: Shows what's been completed and what's next
- backend/python/solver/constraint_solver.py: The OR-Tools constraint solver implementation
- backend/python/solver/solution_validator.py: Validator for the solutions
- backend/python/tests/test_solver_pytest.py: Comprehensive testing suite
- backend/src/services/solver.service.ts: Node.js service that interfaces with the Python solver
- backend/src/services/schedule.service.ts: Service for schedule generation and management

## Technical Requirements
The CSV Import/Export functionality needs to handle:
1. Importing class conflict data from CSV files
2. Validating CSV data format and content
3. Converting CSV data to the format required by the constraint solver
4. Exporting generated schedules to CSV format
5. Handling errors gracefully with meaningful error messages

## Current Implementation
We've successfully implemented the Basic Constraint Model with all required constraints:
- Class conflict constraints
- Teacher availability constraints
- Schedule limits (daily/weekly)
- Consecutive class limits
- Optional break after class requirement

We've also created a comprehensive pytest-based testing suite that tests different constraint configurations and validates solutions against all constraints. The testing suite includes tests for:
- Different maximum classes per day settings
- Different maximum consecutive classes settings
- Different break after class settings
- Different rotation week settings
- Testing with CSV datasets (small and medium)

## Specific Tasks
1. Implement CSV import functionality:
   - Create a service to parse CSV files
   - Validate CSV data format and content
   - Convert CSV data to the format required by the constraint solver

2. Implement CSV export functionality:
   - Create a service to export schedules to CSV format
   - Format the CSV output for readability
   - Include relevant metadata in the export

3. Implement error handling:
   - Validate CSV data and provide meaningful error messages
   - Handle edge cases and malformed CSV files
   - Provide clear feedback to the user

## Implementation Approach
- Use a CSV parsing library (e.g., csv-parse for Node.js)
- Create a dedicated service for CSV operations
- Implement validation logic for CSV data
- Create utility functions for data conversion
- Add unit tests for CSV import/export functionality

Please help me implement the CSV Import/Export functionality for the Thunder Scheduler project, focusing on making it robust and user-friendly.