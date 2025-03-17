import { ImportResult, ClassesResponse } from '../types/class.types';
import { postFormData, get } from './api';

export class CSVService {
  private static readonly BASE_PATH = '/csv';

  /**
   * Import classes from a CSV file
   * @param file CSV file to import
   * @returns Import result with success status and any errors
   */
  static async importClasses(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await postFormData<ImportResult>(
        `${this.BASE_PATH}/import`,
        formData
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to import CSV file',
        errors: [{ line: 0, message: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  /**
   * Export schedule to CSV format
   * @param scheduleId ID of the schedule to export
   * @returns Blob containing the CSV data
   */
  static async exportSchedule(scheduleId: string): Promise<Blob> {
    try {
      const response = await get<string>(`${this.BASE_PATH}/export/${scheduleId}`);
      const csvContent = response.data;
      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error) {
      throw new Error('Failed to export schedule');
    }
  }

  /**
   * Download the exported schedule CSV
   * @param scheduleId ID of the schedule to export
   * @param filename Optional filename for the downloaded file
   */
  static async downloadSchedule(scheduleId: string, filename?: string): Promise<void> {
    try {
      const blob = await this.exportSchedule(scheduleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `schedule-${scheduleId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download schedule:', error);
      throw error;
    }
  }

  /**
   * Validate a CSV file before import
   * @param file CSV file to validate
   * @returns Validation result
   */
  static async validateCSV(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await postFormData<ImportResult>(
        `${this.BASE_PATH}/validate`,
        formData
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'CSV validation failed',
        errors: [{ line: 0, message: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }
}