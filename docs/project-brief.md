# Cooking Class Scheduler - Enhanced Project Brief

## 1. Project Vision
- **Project Name**: Cooking Class Scheduler
- **Purpose**: Create an automated scheduling system to efficiently organize cooking classes for 33 elementary school classes, working around existing schedule constraints.
- **Desired Outcome**: A system that reduces the manual work of creating new rotations every 3-4 weeks, accommodates various constraints, and ensures each class is seen once per rotation when possible.

## 2. Current Process & Available Data
- Currently scheduling is done manually on paper grids
- Class conflict data is available in CSV format showing:
  - Each of the 33 classes 
  - Five columns for weekdays (Monday-Friday)
  - Each cell contains period numbers when classes CANNOT be scheduled

## 3. Core Functionality

### Schedule Generation
- Automatically generate a complete schedule based on defined constraints
- Allow setting a minimum threshold of classes (e.g., 27 out of 33) to schedule automatically
- Provide clear indication of which constraints are preventing full scheduling when applicable
- Generate schedules for 3-4 week rotations (variable length based on constraints)

### Constraint Management
- **Teacher Availability Calendar**:
  - Allow teacher to block off specific periods, full days, or date ranges when they are unavailable
  - Support for marking holidays, professional development days, or personal time off
  - These blocked periods must never be scheduled
- User-configurable maximum classes per day
- User-configurable maximum classes per week
- Never schedule more than 2 classes in a row
- Option to require one period break after each class (except last period)
- Set earliest possible start date for rotation
- Each class must be scheduled exactly once per rotation

### Manual Adjustments
- Drag-and-drop interface for manual schedule modifications
- Highlight any constraint violations during manual adjustments
- Allow adding unscheduled classes manually

### Data Import/Export
- Import conflict data from CSV file
- Export completed schedules to CSV format
- Generate printable calendar view

## 4. User Experience Requirements
- Web-based application accessible from standard browsers
- Simple, intuitive interface designed for less technical users
- Clear visual indication of:
  - Scheduled classes
  - Available slots
  - Constraint violations
  - Unscheduled classes
  - Teacher's blocked-off unavailable periods
- Calendar interface for marking teacher unavailability
- Weekly schedule view showing all scheduled classes

## 5. Data Requirements
- For each class, track:
  - Class name
  - Grade level
  - Conflict periods (by day and period)
- Teacher availability data:
  - Specific dates and periods when teacher is unavailable
  - Support for recurring unavailability patterns
- Schedule structure:
  - 8 periods per day
  - 5 days per week (Monday through Friday)
- Normal teaching load: 
  - 3-4 classes per day
  - 12-16 classes per week total

## 6. Future Enhancements (not in initial version)
- User login functionality
- Saving multiple schedule rotations for reference
- Grade-level grouping in schedules
- Tracking previous rotations and reporting
- Advanced constraint relaxation options

## 7. Technical Implementation Notes
- Focus on a clean, easy-to-use interface for non-technical users
- Prioritize the scheduling algorithm's accuracy over advanced features
- Ensure clear visual feedback when constraints cannot be fully satisfied
- Optimize for desktop/laptop use primarily

## 8. Scheduling Algorithm Implementation

### Recommended Technology: Google OR-Tools
- This project should use Google OR-Tools as the core constraint solving engine
- Reasons for selection:
  - Capable of handling all specified hard constraints efficiently
  - Built-in support for constraint relaxation in future phases
  - Can identify scheduling bottlenecks and explain unsolvable scenarios
  - Well-documented with strong community support
  - Free and open-source
  - Supports both hard constraints (must follow) and soft constraints (preferences)

### Constraint Modeling Approach
- Model the scheduling problem as a Constraint Satisfaction Problem (CSP) with:
  - Variables: Each class assignment (33 total)
  - Domain: All possible time slots (5 days × 8 periods)
  - Constraints: All scheduling rules from Section 3
- Implement hard constraints for the initial version:
  1. Class conflict periods (from CSV data)
  2. Teacher unavailability periods
  3. Maximum classes per day limit
  4. Maximum classes per week limit
  5. No more than 2 consecutive classes
  6. Required break after each class (if enabled)

### Implementation Phases

#### Phase 1: Core Scheduling System
- Implement basic constraint satisfaction model with OR-Tools
- Define all hard constraints
- Create simple visualization of scheduled classes
- Implement import of conflict data CSV
- Provide basic reporting on unschedulable classes
- Develop minimal UI for viewing and exporting schedules

#### Phase 2: Enhanced UI and Manual Adjustments
- Implement calendar visualization
- Add drag-and-drop functionality for manual adjustments
- Create teacher availability calendar interface
- Add constraint violation highlighting during manual adjustments
- Implement export to various formats

#### Phase 3: Advanced Scheduling Features (Future)
- Implement constraint relaxation capabilities:
  - Identify which constraints are preventing full scheduling
  - Suggest specific constraints to relax
  - Allow user-configurable prioritization of constraints
- Add support for soft constraints ("nice to haves"):
  - Preferred days/periods for specific classes
  - Grade-level grouping preferences
  - Balanced distribution across days/weeks
- Implement optimization to find the "best" schedule when multiple solutions exist

### Testing Strategy
- A detailed testing approach is provided in the companion document "Testing Approach for Cooking Class Scheduler" 
- The testing document outlines a phased testing strategy using the provided test datasets (small, medium, and full)
- Particular emphasis should be placed on validating the multi-week rotation capabilities and constraint handling
- Testing should proceed incrementally from basic constraint testing to full multi-week scheduling

### Developer Implementation Guidelines
- Build a clear separation between the scheduling engine and UI layers
- Develop a service layer that translates between the OR-Tools model and the application's domain model
- Implement detailed logging of constraint violations to assist with debugging and explanations
- Focus on providing clear user feedback when constraints cannot be satisfied
- Ensure the system can explain why certain classes couldn't be scheduled
- Create unit tests that verify constraint satisfaction
