import { PythonShell } from 'python-shell';
import path from 'path';
import { 
  ClassWithConflicts, 
  BaseTeacherAvailability, 
  ScheduleConstraints,
  ScheduleGenerationRequest,
  BaseAssignment,
  Day
} from '../types';

interface SolverResult {
  status: 'success' | 'infeasible';
  statusCode: number;
  statusString?: string;
  message?: string;
  solution?: SolverAssignment[];
  solveTime: number;
  numClasses?: number;
  numAssignments?: number;
}

interface SolverAssignment {
  classId: string;
  day: Day;
  period: number;
  week: number;
}

interface ValidationResult {
  valid: boolean;
  violations: ValidationViolation[];
  numAssignments: number;
  numClasses: number;
}

interface ValidationViolation {
  type: string;
  message: string;
  [key: string]: any;
}

export class SolverService {
  private pythonPath: string;
  private solverScriptPath: string;
  private validatorScriptPath: string;
  
  constructor() {
    // Set path to Python executable (configurable via env var)
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    
    // Set paths to Python scripts
    this.solverScriptPath = path.join(__dirname, '../../python/solver/constraint_solver.py');
    this.validatorScriptPath = path.join(__dirname, '../../python/solver/solution_validator.py');
  }
  
  /**
   * Generate a schedule using the constraint solver
   * @param classes List of classes with their conflicts
   * @param teacherAvailability List of teacher availability records
   * @param request Schedule generation request with constraints
   * @returns List of assignments if successful
   */
  async generateSchedule(
    classes: ClassWithConflicts[],
    teacherAvailability: BaseTeacherAvailability[],
    request: ScheduleGenerationRequest
  ): Promise<Omit<BaseAssignment, 'id'>[]> {
    // Prepare input data for Python solver
    const inputData = {
      classes: classes.map(c => ({ id: c.id, name: c.name, gradeLevel: c.gradeLevel })),
      conflicts: this._formatConflicts(classes),
      teacherAvailability: this._formatTeacherAvailability(teacherAvailability),
      constraints: request.constraints,
      startDate: request.startDate,
      endDate: request.endDate,
      rotationWeeks: request.rotationWeeks
    };
    
    try {
      // Execute Python solver
      const result = await this._executePythonScript<SolverResult>(
        this.solverScriptPath,
        inputData
      );
      
      // Process results
      if (result.status === 'success' && result.solution) {
        return result.solution.map(assignment => ({
          // Omit id field to let Prisma generate it
          classId: assignment.classId,
          day: assignment.day,
          period: assignment.period,
          week: assignment.week,
          scheduleId: '', // Will be set by schedule service
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      } else {
        throw new Error(result.message || 'No solution found');
      }
    } catch (error) {
      console.error('Error executing Python solver:', error);
      throw error;
    }
  }
  
  /**
   * Validate a schedule against constraints
   * @param assignments List of assignments to validate
   * @param classes List of classes with their conflicts
   * @param teacherAvailability List of teacher availability records
   * @param constraints Schedule constraints
   * @returns Validation result with any violations
   */
  async validateSchedule(
    assignments: BaseAssignment[],
    classes: ClassWithConflicts[],
    teacherAvailability: BaseTeacherAvailability[],
    constraints: ScheduleConstraints
  ): Promise<ValidationResult> {
    // Prepare input data for Python validator
    const inputData = {
      assignments: assignments.map(a => ({
        classId: a.classId,
        day: a.day,
        period: a.period,
        week: a.week
      })),
      classes: classes.map(c => ({ id: c.id, name: c.name, gradeLevel: c.gradeLevel })),
      conflicts: this._formatConflicts(classes),
      teacherAvailability: this._formatTeacherAvailability(teacherAvailability),
      constraints: constraints
    };
    
    try {
      // Execute Python validator
      return await this._executePythonScript<ValidationResult>(
        this.validatorScriptPath,
        inputData
      );
    } catch (error) {
      console.error('Error executing Python validator:', error);
      throw error;
    }
  }
  
  /**
   * Format class conflicts for the Python solver
   * @param classes List of classes with their conflicts
   * @returns Formatted conflicts object
   */
  private _formatConflicts(classes: ClassWithConflicts[]) {
    // Format conflicts for Python solver
    const conflicts: Record<string, Record<string, number[]>> = {};
    
    classes.forEach(cls => {
      conflicts[cls.id] = {};
      cls.conflicts.forEach(conflict => {
        conflicts[cls.id][conflict.day] = conflict.periods;
      });
    });
    
    return conflicts;
  }
  
  /**
   * Format teacher availability for the Python solver
   * @param availability List of teacher availability records
   * @returns Formatted availability object
   */
  private _formatTeacherAvailability(availability: BaseTeacherAvailability[]) {
    // Format teacher availability for Python solver
    // Group by date and convert to day of week
    const formattedAvailability: Record<string, number[]> = {};
    
    availability.forEach(avail => {
      const date = new Date(avail.date);
      const dayIndex = date.getDay();
      
      // Skip weekends
      if (dayIndex === 0 || dayIndex === 6) {
        return;
      }
      
      // Convert day index to day enum
      const days = [null, Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
      const day = days[dayIndex];
      
      if (day) {
        if (!formattedAvailability[day]) {
          formattedAvailability[day] = [];
        }
        
        formattedAvailability[day] = [
          ...formattedAvailability[day],
          ...avail.blockedPeriods
        ];
      }
    });
    
    return formattedAvailability;
  }
  
  /**
   * Execute a Python script with the given input data
   * @param scriptPath Path to the Python script
   * @param inputData Input data for the script
   * @returns Script output
   */
  private async _executePythonScript<T>(scriptPath: string, inputData: any): Promise<T> {
    return new Promise((resolve, reject) => {
      // Set up Python shell options
      const options = {
        mode: 'json' as const,
        pythonPath: this.pythonPath,
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: path.dirname(scriptPath),
        args: []
      };
      
      // Create Python shell
      const pyshell = new PythonShell(path.basename(scriptPath), options);
      
      // Send input data
      pyshell.send(inputData);
      
      let result: any = null;
      
      // Handle messages from Python
      pyshell.on('message', (message) => {
        result = message;
      });
      
      // Handle errors
      pyshell.on('error', (err) => {
        reject(err);
      });
      
      // Handle script end
      pyshell.end((err) => {
        if (err) {
          reject(err);
        } else if (result) {
          resolve(result as T);
        } else {
          reject(new Error('No result returned from Python script'));
        }
      });
    });
  }
}