import { Schedule, Assignment, Conflict } from '../types/schedule.types';
import { APIResponse, Class, DailyConflicts, TeacherAvailability } from '../types/class.types';
import { get, post, put } from './api';

export class ScheduleService {
  private static readonly BASE_PATH = '/schedule';
  private static readonly CLASS_PATH = '/class';
  private static readonly AVAILABILITY_PATH = '/availability';

  /**
   * Fetch a schedule by ID
   * @param scheduleId ID of the schedule to fetch
   */
  static async getSchedule(scheduleId: string): Promise<Schedule> {
    console.log('[DEBUG] ScheduleService: Getting schedule by ID:', scheduleId);
    try {
      const response = await get<Schedule>(`${this.BASE_PATH}/${scheduleId}`);
      console.log('[DEBUG] ScheduleService: Raw schedule response:', response);
      
      // Check if response is valid
      if (!response) {
        console.error('[DEBUG] ScheduleService: No response received');
        throw new Error('No response received from API');
      }
      
      // Check if response has data property
      if (!response.data) {
        console.error('[DEBUG] ScheduleService: Response missing data property:', response);
        throw new Error('Invalid response format: missing data property');
      }
      
      console.log('[DEBUG] ScheduleService: Returning schedule:', response.data);
      return response.data;
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error getting schedule:', error);
      throw error;
    }
  }

  /**
   * Fetch all schedules
   */
  static async getAllSchedules(): Promise<Schedule[]> {
    console.log('[DEBUG] ScheduleService: Getting all schedules');
    try {
      const response = await get<{data: Schedule[]; success: boolean}>(this.BASE_PATH);
      console.log('[DEBUG] ScheduleService: Raw schedule response:', response);
      
      // Check if response is valid
      if (!response?.success) {
        console.error('[DEBUG] ScheduleService: API request failed');
        return [];
      }
      
      // Check if response has data
      if (!response.data) {
        console.error('[DEBUG] ScheduleService: Response missing data property');
        return [];
      }
      
      // Check if data is an array
      if (!Array.isArray(response.data)) {
        console.error('[DEBUG] ScheduleService: Response data is not an array');
        return [];
      }
      
      console.log('[DEBUG] ScheduleService: Returning schedules:', response.data);
      return response.data;
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error getting schedules:', error);
      throw error;
    }
  }

  /**
   * Create a new schedule
   * @param schedule Schedule data without ID
   */
  static async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      const response = await post<Schedule>(this.BASE_PATH, schedule);
      console.log('[DEBUG] ScheduleService: Create schedule response:', response);
      return response.data || ({} as Schedule);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error creating schedule:', error);
      return {} as Schedule;
    }
  }

  /**
   * Update an existing schedule
   * @param scheduleId ID of the schedule to update
   * @param updates Partial schedule data to update
   */
  static async updateSchedule(
    scheduleId: string,
    updates: Partial<Schedule>
  ): Promise<Schedule> {
    try {
      const response = await put<Schedule>(`${this.BASE_PATH}/${scheduleId}`, updates);
      return response.data || ({} as Schedule);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error updating schedule:', error);
      return {} as Schedule;
    }
  }

  /**
   * Generate a new schedule based on constraints
   * @param params Schedule generation parameters
   */
  static async generateSchedule(params: {
    startDate: string;
    endDate: string;
    rotationWeeks: number;
  }): Promise<Schedule> {
    try {
      const response = await post<Schedule>(`${this.BASE_PATH}/generate`, params);
      console.log('[DEBUG] ScheduleService: Generate schedule response:', response);
      return response.data || ({} as Schedule);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error generating schedule:', error);
      return {} as Schedule;
    }
  }

  /**
   * Update assignment in a schedule
   * @param scheduleId ID of the schedule
   * @param assignment Assignment data to update
   */
  static async updateAssignment(
    scheduleId: string,
    assignment: Assignment
  ): Promise<Schedule> {
    try {
      const response = await put<Schedule>(
        `${this.BASE_PATH}/${scheduleId}/assignments`,
        assignment
      );
      console.log('[DEBUG] ScheduleService: Update assignment response:', response);
      return response.data || ({} as Schedule);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error updating assignment:', error);
      return {} as Schedule;
    }
  }

  /**
   * Validate schedule changes
   * @param scheduleId ID of the schedule
   * @param changes Proposed changes to validate
   */
  static async validateChanges(
    scheduleId: string,
    changes: Partial<Schedule>
  ): Promise<{ valid: boolean; conflicts: string[] }> {
    try {
      const response = await post<{ valid: boolean; conflicts: string[] }>(
        `${this.BASE_PATH}/${scheduleId}/validate`,
        changes
      );
      console.log('[DEBUG] ScheduleService: Validate changes response:', response);
      return response.data || { valid: false, conflicts: [] };
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error validating changes:', error);
      return { valid: false, conflicts: [] };
    }
  }

  /**
   * Auto-resolve conflicts in a schedule
   * @param scheduleId ID of the schedule to resolve conflicts for
   */
  static async resolveConflicts(
    scheduleId: string
  ): Promise<Schedule> {
    try {
      const response = await post<Schedule>(
        `${this.BASE_PATH}/${scheduleId}/resolve-conflicts`,
        {}
      );
      console.log('[DEBUG] ScheduleService: Resolve conflicts response:', response);
      return response.data || ({} as Schedule);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error resolving conflicts:', error);
      return {} as Schedule;
    }
  }

  /**
   * Get conflicts for a schedule
   * @param scheduleId ID of the schedule
   */
  static async getScheduleConflicts(scheduleId: string): Promise<Conflict[]> {
    try {
      console.log('[DEBUG] ScheduleService: Fetching conflicts for schedule:', scheduleId);
      
      const response = await get<APIResponse<any>>(`${this.BASE_PATH}/${scheduleId}/conflicts`);
      console.log('[DEBUG] ScheduleService: Raw response:', response);

      if (!response?.success) {
        console.warn('[DEBUG] ScheduleService: Response indicates failure:', response);
        return [];
      }

      const conflicts = response.data;
      console.log('[DEBUG] ScheduleService: Extracted conflicts:', conflicts);

      if (!Array.isArray(conflicts)) {
        console.warn('[DEBUG] ScheduleService: Expected array but got:', typeof conflicts);
        return [];
      }

      // Filter and validate conflicts
      const validConflicts = conflicts
        .filter(conflict => {
          const isValid =
            conflict &&
            typeof conflict === 'object' &&
            'day' in conflict &&
            'period' in conflict &&
            typeof conflict.period === 'number';

          if (!isValid) {
            console.warn('[DEBUG] ScheduleService: Invalid conflict:', conflict);
          }

          return isValid;
        })
        .map(conflict => ({
          classId: conflict.classId,
          day: conflict.day,
          period: conflict.period,
          type: conflict.type || 'class',
          message: conflict.message || 'Conflict detected'
        }));

      console.log('[DEBUG] ScheduleService: Returning validated conflicts:', validConflicts);
      return validConflicts;
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error getting schedule conflicts:', error);
      return [];
    }
  }

  /**
   * Get a class by ID
   * @param classId ID of the class to fetch
   */
  static async getClass(classId: string): Promise<{data: Class; success: boolean}> {
    console.log('[DEBUG] ScheduleService: Getting class by ID:', classId);
    try {
      const response = await get<{data: Class; success: boolean}>(`${this.CLASS_PATH}/${classId}`);
      console.log('[DEBUG] ScheduleService: Raw class response:', response);
      
      // Check if response is valid
      if (!response) {
        console.error('[DEBUG] ScheduleService: No response received');
        throw new Error('No response received from API');
      }
      
      
      // Check if response has data property
      if (!response.data) {
        console.error('[DEBUG] ScheduleService: Response missing data property:', response);
        throw new Error('Invalid response format: missing data property');
      }
      
      console.log('[DEBUG] ScheduleService: Returning class:', response.data);
      return response.data;
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error getting class:', error);
      throw error;
    }
  }
  /**
   * Get all classes
   */
  static async getAllClasses(): Promise<Class[]> {
    console.log('[DEBUG] ScheduleService: Getting all classes');
    try {
      const response = await get<{data: Class[]; success: boolean}>(this.CLASS_PATH);
      console.log('[DEBUG] ScheduleService: Raw class response:', response);
      
      // Check if response is valid
      if (!response?.success) {
        console.error('[DEBUG] ScheduleService: API request failed');
        return [];
      }
      
      // Check if response has data
      if (!response.data) {
        console.error('[DEBUG] ScheduleService: Response missing data property');
        return [];
      }

      // Check if data is an array
      if (!Array.isArray(response.data)) {
        console.error('[DEBUG] ScheduleService: Response data is not an array');
        return [];
      }
      
      console.log('[DEBUG] ScheduleService: Returning classes:', response.data);
      return response.data;
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error getting classes:', error);
      throw error;
    }
  }

  /**
   * Update conflicts for a class
   * @param classId ID of the class
   * @param conflicts Array of daily conflicts
   */
  static async updateClassConflicts(
    classId: string,
    conflicts: DailyConflicts[]
  ): Promise<Class> {
    try {
      const response = await put<Class>(`${this.CLASS_PATH}/${classId}/conflicts`, conflicts);
      console.log('[DEBUG] ScheduleService: Update class conflicts response:', response);
      return response.data || ({} as Class);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error updating class conflicts:', error);
      return {} as Class;
    }
  }

  /**
   * Get teacher availability for a specific date
   * @param date Date to get availability for (YYYY-MM-DD format)
   */
  static async getAvailability(date: string): Promise<TeacherAvailability> {
    try {
      const response = await get<TeacherAvailability>(`${this.AVAILABILITY_PATH}/${date}`);
      console.log('[DEBUG] ScheduleService: Get availability response:', response);
      return response.data || ({} as TeacherAvailability);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error getting availability:', error);
      return {} as TeacherAvailability;
    }
  }

  /**
   * Update teacher availability
   * @param availability Teacher availability data
   */
  static async updateAvailability(
    availability: TeacherAvailability
  ): Promise<TeacherAvailability> {
    try {
      const response = await post<TeacherAvailability>(
        this.AVAILABILITY_PATH,
        availability
      );
      console.log('[DEBUG] ScheduleService: Update availability response:', response);
      return response.data || ({} as TeacherAvailability);
    } catch (error) {
      console.error('[DEBUG] ScheduleService: Error updating availability:', error);
      return {} as TeacherAvailability;
    }
  }
}