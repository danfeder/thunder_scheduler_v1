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
    const response = await get<Schedule>(`${this.BASE_PATH}/${scheduleId}`);
    return response.data;
  }

  /**
   * Fetch all schedules
   */
  static async getAllSchedules(): Promise<Schedule[]> {
    const response = await get<Schedule[]>(this.BASE_PATH);
    return response.data;
  }

  /**
   * Create a new schedule
   * @param schedule Schedule data without ID
   */
  static async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    const response = await post<Schedule>(this.BASE_PATH, schedule);
    return response.data;
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
    const response = await put<Schedule>(`${this.BASE_PATH}/${scheduleId}`, updates);
    return response.data;
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
    const response = await post<Schedule>(`${this.BASE_PATH}/generate`, params);
    return response.data;
  }

  /**
   * Update assignment in a schedule
   * @param scheduleId ID of the schedule
   * @param assignment Assignment data to update
   */
  static async updateAssignment(
    scheduleId: string,
    assignment: Assignment
  ): Promise<APIResponse<Schedule>> {
    return await put<Schedule>(
      `${this.BASE_PATH}/${scheduleId}/assignments`,
      assignment
    );
  }

  /**
   * Validate schedule changes
   * @param scheduleId ID of the schedule
   * @param changes Proposed changes to validate
   */
  static async validateChanges(
    scheduleId: string,
    changes: Partial<Schedule>
  ): Promise<APIResponse<{ valid: boolean; conflicts: string[] }>> {
    return await post<{ valid: boolean; conflicts: string[] }>(
      `${this.BASE_PATH}/${scheduleId}/validate`,
      changes
    );
  }

  /**
   * Auto-resolve conflicts in a schedule
   * @param scheduleId ID of the schedule to resolve conflicts for
   */
  static async resolveConflicts(
    scheduleId: string
  ): Promise<APIResponse<Schedule>> {
    return await post<Schedule>(
      `${this.BASE_PATH}/${scheduleId}/resolve-conflicts`,
      {}
    );
  }

  /**
   * Get conflicts for a schedule
   * @param scheduleId ID of the schedule
   */
  static async getScheduleConflicts(scheduleId: string): Promise<Conflict[]> {
    const response = await get<Conflict[]>(`${this.BASE_PATH}/${scheduleId}/conflicts`);
    return response.data;
  }

  /**
   * Get a class by ID
   * @param classId ID of the class to fetch
   */
  static async getClass(classId: string): Promise<Class> {
    const response = await get<Class>(`${this.CLASS_PATH}/${classId}`);
    return response.data;
  }

  /**
   * Get all classes
   */
  static async getAllClasses(): Promise<Class[]> {
    const response = await get<Class[]>(this.CLASS_PATH);
    return response.data;
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
    const response = await put<Class>(`${this.CLASS_PATH}/${classId}/conflicts`, conflicts);
    return response.data;
  }

  /**
   * Get teacher availability for a specific date
   * @param date Date to get availability for (YYYY-MM-DD format)
   */
  static async getAvailability(date: string): Promise<TeacherAvailability> {
    const response = await get<TeacherAvailability>(`${this.AVAILABILITY_PATH}/${date}`);
    return response.data;
  }

  /**
   * Update teacher availability
   * @param availability Teacher availability data
   */
  static async updateAvailability(
    availability: TeacherAvailability
  ): Promise<TeacherAvailability> {
    const response = await put<TeacherAvailability>(this.AVAILABILITY_PATH, availability);
    return response.data;
  }
}