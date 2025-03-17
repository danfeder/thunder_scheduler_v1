import { Schedule, Assignment } from '../types/schedule.types';
import { APIResponse } from '../types/class.types';
import { get, post, put } from './api';

export class ScheduleService {
  private static readonly BASE_PATH = '/schedule';

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
}