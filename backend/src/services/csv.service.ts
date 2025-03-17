import { parseStream } from '@fast-csv/parse';
import { format } from '@fast-csv/format';
import { Readable } from 'stream';
import {
  ClassConflictData,
  ValidationResult,
  ValidationError,
  ValidationErrorType,
  ErrorCode,
  CSV_VALIDATION_RULES,
  CsvParseOptions,
  CsvRowData
} from '../types/csv.types';
import { Day } from '../types';
import { ScheduleWithAssignments, BaseAssignment } from '../types';

export class CsvService {
  /**
   * Parse CSV data containing class conflicts
   * @param csvData Raw CSV string data
   * @param options Parsing options
   */
  async parseClassConflicts(
    csvData: string,
    options: CsvParseOptions = {}
  ): Promise<ClassConflictData[]> {
    const {
      skipHeader = false,
      validateFormat = true,
      maxPeriods = CSV_VALIDATION_RULES.maxPeriods
    } = options;

    // First validate CSV format if required
    if (validateFormat) {
      const validationResult = await this.validateCsvFormat(csvData);
      if (!validationResult.isValid) {
        throw new Error(
          `Invalid CSV format: ${validationResult.errors
            .map((e) => e.message)
            .join(', ')}`
        );
      }
    }

    return new Promise<ClassConflictData[]>((resolve, reject) => {
      const records: ClassConflictData[] = [];
      const errors: ValidationError[] = [];
      let lineNumber = 1;

      const stream = Readable.from([csvData]);
      const parser = parseStream(stream, { headers: true })
        .on('error', (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        })
        .on('data', (row: Record<string, string>) => {
          try {
            const className = row['Class'];
            const monday = row['Monday'];
            const tuesday = row['Tuesday'];
            const wednesday = row['Wednesday'];
            const thursday = row['Thursday'];
            const friday = row['Friday'];

            // Validate class name
            if (!className || !CSV_VALIDATION_RULES.classNameFormat.test(className)) {
              errors.push({
                type: ValidationErrorType.CONTENT,
                code: ErrorCode.EMPTY_CLASS,
                message: `Invalid class name: ${className}`,
                line: lineNumber,
                column: 'Class'
              });
              return;
            }

            // Parse conflicts for each day
            const conflicts: Record<Day, number[]> = {
              [Day.MONDAY]: this.parsePeriods(monday, lineNumber, 'Monday', maxPeriods, errors),
              [Day.TUESDAY]: this.parsePeriods(tuesday, lineNumber, 'Tuesday', maxPeriods, errors),
              [Day.WEDNESDAY]: this.parsePeriods(wednesday, lineNumber, 'Wednesday', maxPeriods, errors),
              [Day.THURSDAY]: this.parsePeriods(thursday, lineNumber, 'Thursday', maxPeriods, errors),
              [Day.FRIDAY]: this.parsePeriods(friday, lineNumber, 'Friday', maxPeriods, errors)
            };

            records.push({ className, conflicts });
            lineNumber++;
          } catch (error) {
            errors.push({
              type: ValidationErrorType.CONTENT,
              code: ErrorCode.MALFORMED_CSV,
              message: error instanceof Error ? error.message : 'Unknown error parsing row',
              line: lineNumber
            });
          }
        })
        .on('end', () => {
          if (errors.length > 0) {
            reject(new Error(JSON.stringify(errors)));
          } else {
            resolve(records);
          }
        });
    });
  }

  /**
   * Validate CSV format and structure
   * @param csvData Raw CSV string data
   */
  async validateCsvFormat(csvData: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Basic format checks
    if (!csvData.trim()) {
      errors.push({
        type: ValidationErrorType.FORMAT,
        code: ErrorCode.MALFORMED_CSV,
        message: 'CSV data is empty'
      });
      return { isValid: false, errors };
    }

    // Parse header row
    const firstLine = csvData.split('\n')[0];
    if (!firstLine) {
      errors.push({
        type: ValidationErrorType.FORMAT,
        code: ErrorCode.MISSING_HEADERS,
        message: 'CSV file has no headers'
      });
      return { isValid: false, errors };
    }

    // Check headers
    const headers = firstLine.trim().split(',');
    const expectedHeaders = CSV_VALIDATION_RULES.headers;
    
    if (headers.length !== expectedHeaders.length) {
      errors.push({
        type: ValidationErrorType.FORMAT,
        code: ErrorCode.MISSING_HEADERS,
        message: `Expected ${expectedHeaders.length} headers but found ${headers.length}`
      });
    } else {
      headers.forEach((header, index) => {
        if (header !== expectedHeaders[index]) {
          errors.push({
            type: ValidationErrorType.FORMAT,
            code: ErrorCode.MISSING_HEADERS,
            message: `Invalid header at position ${index + 1}: expected "${expectedHeaders[index]}" but found "${header}"`
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse periods string into array of numbers
   */
  private parsePeriods(
    periodsStr: string,
    lineNumber: number,
    day: string,
    maxPeriods: number,
    errors: ValidationError[]
  ): number[] {
    if (!periodsStr) return [];

    // Validate period format
    if (!CSV_VALIDATION_RULES.periodFormat.test(periodsStr)) {
      errors.push({
        type: ValidationErrorType.CONTENT,
        code: ErrorCode.INVALID_PERIOD,
        message: `Invalid period format for ${day}`,
        line: lineNumber,
        column: day,
        value: periodsStr
      });
      return [];
    }

    const periods = periodsStr
      .split(CSV_VALIDATION_RULES.periodDelimiter)
      .map(p => parseInt(p, 10))
      .filter(p => !isNaN(p));

    // Validate period numbers
    const invalidPeriods = periods.filter(p => p < 1 || p > maxPeriods);
    if (invalidPeriods.length > 0) {
      errors.push({
        type: ValidationErrorType.CONTENT,
        code: ErrorCode.PERIOD_OUT_OF_RANGE,
        message: `Invalid periods for ${day}: ${invalidPeriods.join(', ')}`,
        line: lineNumber,
        column: day,
        value: periodsStr
      });
      return periods.filter(p => p >= 1 && p <= maxPeriods);
    }

    return periods;
  }

  /**
   * Generate CSV string from schedule data
   * @param schedule Schedule data to export
   * @returns CSV string
   */
  async generateScheduleCsv(schedule: ScheduleWithAssignments): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const rows: Record<string, string>[] = [];
        let csvContent = '';

        // Group assignments by week
        const assignmentsByWeek = new Map<number, BaseAssignment[]>();
        schedule.assignments.forEach(assignment => {
          const weekAssignments = assignmentsByWeek.get(assignment.week) || [];
          weekAssignments.push(assignment);
          assignmentsByWeek.set(assignment.week, weekAssignments);
        });

        // Process each week
        assignmentsByWeek.forEach((weekAssignments, weekNumber) => {
          // Add week header
          rows.push({
            'Week': `Week ${weekNumber}`,
            'Period 1': '',
            'Period 2': '',
            'Period 3': '',
            'Period 4': '',
            'Period 5': '',
            'Period 6': '',
            'Period 7': '',
            'Period 8': ''
          });

          // Add daily schedules
          [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY].forEach(day => {
            const dayRow: Record<string, string> = {
              'Week': day
            };

            // Fill periods
            for (let period = 1; period <= 8; period++) {
              const assignment = weekAssignments.find(
                a => a.day === day && a.period === period
              );
              dayRow[`Period ${period}`] = assignment ? assignment.classId : '';
            }

            rows.push(dayRow);
          });

          // Add empty row between weeks
          rows.push({
            'Week': '',
            'Period 1': '',
            'Period 2': '',
            'Period 3': '',
            'Period 4': '',
            'Period 5': '',
            'Period 6': '',
            'Period 7': '',
            'Period 8': ''
          });
        });
        
        // Create CSV formatter stream
        const csvStream = format({ 
          headers: ['Week', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'],
          delimiter: ',' 
        });
        
        // Collect CSV data
        csvStream.on('data', (data) => {
          csvContent += data;
        });
        
        // Resolve with complete CSV when done
        csvStream.on('end', () => {
          resolve(csvContent);
        });

        // Write rows to stream
        rows.forEach(row => csvStream.write(row));
        csvStream.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}