import { Day } from './index';

export interface CsvParseOptions {
  skipHeader?: boolean;
  validateFormat?: boolean;
  maxPeriods?: number;
}

export interface ClassConflictData {
  className: string;
  conflicts: {
    [key in Day]: number[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  type: ValidationErrorType;
  code: ErrorCode;
  message: string;
  line?: number;
  column?: string;
  value?: string;
}

export enum ValidationErrorType {
  FORMAT = 'FORMAT_ERROR',
  CONTENT = 'CONTENT_ERROR'
}

export enum ErrorCode {
  // Format errors
  MISSING_HEADERS = 'MISSING_HEADERS',
  INVALID_DELIMITER = 'INVALID_DELIMITER',
  MALFORMED_CSV = 'MALFORMED_CSV',
  
  // Content errors
  INVALID_PERIOD = 'INVALID_PERIOD',
  EMPTY_CLASS = 'EMPTY_CLASS',
  DUPLICATE_CLASS = 'DUPLICATE_CLASS',
  INVALID_DAY = 'INVALID_DAY',
  PERIOD_OUT_OF_RANGE = 'PERIOD_OUT_OF_RANGE'
}

export const CSV_VALIDATION_RULES = {
  headers: ['Class', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periodFormat: /^(\d+)(;\d+)*$/,
  classNameFormat: /^[A-Za-z0-9\s-]+$/,
  maxPeriods: 10,
  periodDelimiter: ';'
} as const;

export type CsvRowData = [string, string, string, string, string, string]; // [Class, Monday, Tuesday, Wednesday, Thursday, Friday]