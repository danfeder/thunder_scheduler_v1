import { CsvService } from '../services/csv.service';
import { ValidationErrorType, ErrorCode } from '../types/csv.types';
import { Day, ScheduleWithAssignments } from '../types';

describe('CsvService', () => {
  let csvService: CsvService;

  beforeEach(() => {
    csvService = new CsvService();
  });

  describe('validateCsvFormat', () => {
    it('should validate correct CSV format', async () => {
      const validCsv = 'Class,Monday,Tuesday,Wednesday,Thursday,Friday\nClass 1A,1;2;3,6;7,4;5,2;3,7;8';
      const result = await csvService.validateCsvFormat(validCsv);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty CSV', async () => {
      const result = await csvService.validateCsvFormat('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toEqual(
        expect.objectContaining({
          type: ValidationErrorType.FORMAT,
          code: ErrorCode.MALFORMED_CSV,
          message: 'CSV data is empty'
        })
      );
    });

    it('should reject CSV with incorrect headers', async () => {
      const invalidCsv = 'Class,Mon,Tue,Wed,Thu,Fri\nClass 1A,1;2;3,6;7,4;5,2;3,7;8';
      const result = await csvService.validateCsvFormat(invalidCsv);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe(ErrorCode.MISSING_HEADERS);
    });
  });

  describe('parseClassConflicts', () => {
    it('should parse valid CSV data', async () => {
      const validCsv = 'Class,Monday,Tuesday,Wednesday,Thursday,Friday\nClass 1A,1;2;3,6;7,4;5,2;3,7;8';
      const result = await csvService.parseClassConflicts(validCsv);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        className: 'Class 1A',
        conflicts: {
          [Day.MONDAY]: [1, 2, 3],
          [Day.TUESDAY]: [6, 7],
          [Day.WEDNESDAY]: [4, 5],
          [Day.THURSDAY]: [2, 3],
          [Day.FRIDAY]: [7, 8]
        }
      });
    });

    it('should reject invalid period formats', async () => {
      const invalidCsv = 'Class,Monday,Tuesday,Wednesday,Thursday,Friday\nClass 1A,1,2,3,6;7;invalid,4;5';
      await expect(csvService.parseClassConflicts(invalidCsv)).rejects.toThrow();
    });

    it('should reject invalid class names', async () => {
      const invalidCsv = 'Class,Monday,Tuesday,Wednesday,Thursday,Friday\n,1;2;3,6;7,4;5,2;3,7;8';
      await expect(csvService.parseClassConflicts(invalidCsv)).rejects.toThrow();
    });

    it('should handle empty periods', async () => {
      const csvWithEmpty = 'Class,Monday,Tuesday,Wednesday,Thursday,Friday\nClass 1A,,6;7,,2;3,';
      const result = await csvService.parseClassConflicts(csvWithEmpty);
      
      expect(result[0].conflicts).toEqual({
        [Day.MONDAY]: [],
        [Day.TUESDAY]: [6, 7],
        [Day.WEDNESDAY]: [],
        [Day.THURSDAY]: [2, 3],
        [Day.FRIDAY]: []
      });
    });

    it('should reject periods outside valid range', async () => {
      const invalidCsv = 'Class,Monday,Tuesday,Wednesday,Thursday,Friday\nClass 1A,1;2;11,6;7,4;5,2;3,7;8';
      await expect(csvService.parseClassConflicts(invalidCsv)).rejects.toThrow();
    });
  });

  describe('generateScheduleCsv', () => {
    it('should generate valid CSV format', async () => {
      const mockSchedule: ScheduleWithAssignments = {
        id: '1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        rotationWeeks: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignments: [
          {
            id: 'a1',
            scheduleId: '1',
            classId: 'Class 1A',
            day: Day.MONDAY,
            period: 1,
            week: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'a2',
            scheduleId: '1',
            classId: 'Class 1B',
            day: Day.MONDAY,
            period: 2,
            week: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      const csvString = await csvService.generateScheduleCsv(mockSchedule);
      expect(typeof csvString).toBe('string');
      expect(csvString).toContain('Week 1');
      expect(csvString).toContain('Class 1A');
      expect(csvString).toContain('Class 1B');
    });
  });
});