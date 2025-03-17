import { CsvService } from '../services/csv.service';
import * as fs from 'fs';
import * as path from 'path';
import { Day, ScheduleWithAssignments } from '../types';

async function testCsvImport() {
  const csvService = new CsvService();
  
  try {
    // Read test CSV file
    const csvData = fs.readFileSync(
      path.join(__dirname, '../../../test_data/small-test-data.csv'),
      'utf-8'
    );

    console.log('Reading CSV data...');
    console.log('-------------------');
    console.log(csvData);
    console.log('-------------------\n');

    // Parse CSV data
    console.log('Parsing CSV data...');
    const result = await csvService.parseClassConflicts(csvData);
    
    console.log('Parsed Data:');
    console.log('-------------------');
    console.log(JSON.stringify(result, null, 2));
    console.log('-------------------\n');
    
    // Validate CSV format
    console.log('Validating CSV format...');
    const validation = await csvService.validateCsvFormat(csvData);
    
    console.log('Validation Result:');
    console.log('-------------------');
    console.log(JSON.stringify(validation, null, 2));
    console.log('-------------------\n');

    // Test schedule export
    console.log('Testing schedule export...');
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
        },
        {
          id: 'a3',
          scheduleId: '1',
          classId: 'Class 2A',
          day: Day.TUESDAY,
          period: 3,
          week: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'a4',
          scheduleId: '1',
          classId: 'Class 2B',
          day: Day.WEDNESDAY,
          period: 4,
          week: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    };

    const exportedCsv = await csvService.generateScheduleCsv(mockSchedule);
    console.log('Exported Schedule CSV:');
    console.log('-------------------');
    console.log(exportedCsv);
    console.log('-------------------\n');

    // Save exported CSV to file
    const outputPath = path.join(__dirname, '../../../test_data/exported-schedule.csv');
    fs.writeFileSync(outputPath, exportedCsv);
    console.log(`Schedule exported to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error processing CSV:', error);
  }
}

// Run the test
testCsvImport();