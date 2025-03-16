import { PrismaClient } from '@prisma/client';
import { ClassService } from './services/class.service';
import { ScheduleService } from './services/schedule.service';
import { SolverService } from './services/solver.service';
import { ScheduleGenerationRequest, ScheduleConstraints } from './types';
import fs from 'fs';
import path from 'path';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize services
const classService = new ClassService(prisma);
const scheduleService = new ScheduleService(prisma);
const solverService = new SolverService();

/**
 * Test the solver with a small dataset
 */
async function testSolver() {
  try {
    console.log('Starting solver test...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.assignment.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.conflict.deleteMany();
    await prisma.class.deleteMany();
    await prisma.teacherAvailability.deleteMany();
    
    // Import test data
    console.log('Importing test data...');
    const csvPath = path.join(__dirname, '../../test_data/small-test-data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    await classService.importClassesFromCSV(csvData);
    
    // Get all classes
    const classes = await classService.getAllClasses();
    console.log(`Imported ${classes.length} classes`);
    
    // Create some teacher availability
    console.log('Creating teacher availability...');
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
    
    // Create teacher unavailability for Monday morning and Friday afternoon
    await scheduleService.createTeacherAvailability({
      date: new Date(startDate),
      blockedPeriods: [1, 2],
      reason: 'Staff meeting'
    });
    
    const fridayDate = new Date(startDate);
    fridayDate.setDate(startDate.getDate() + 4); // Friday
    await scheduleService.createTeacherAvailability({
      date: fridayDate,
      blockedPeriods: [7, 8],
      reason: 'Early dismissal'
    });
    
    // Set up schedule generation request
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // 5 days (Monday to Friday)
    
    const constraints: ScheduleConstraints = {
      maxClassesPerDay: 3,
      maxClassesPerWeek: 12,
      maxConsecutiveClasses: 2,
      requireBreakAfterClass: true
    };
    
    const request: ScheduleGenerationRequest = {
      startDate,
      endDate,
      rotationWeeks: 1,
      constraints
    };
    
    // Generate schedule
    console.log('Generating schedule...');
    console.log(`Start date: ${startDate.toISOString()}`);
    console.log(`End date: ${endDate.toISOString()}`);
    console.log('Constraints:', JSON.stringify(constraints, null, 2));
    
    const schedule = await scheduleService.generateSchedule(request);
    
    // Print results
    console.log('\nSchedule generated successfully!');
    console.log(`Schedule ID: ${schedule.id}`);
    console.log(`Number of assignments: ${schedule.assignments.length}`);
    
    // Group assignments by day
    const assignmentsByDay: Record<string, any[]> = {};
    schedule.assignments.forEach(assignment => {
      if (!assignmentsByDay[assignment.day]) {
        assignmentsByDay[assignment.day] = [];
      }
      assignmentsByDay[assignment.day].push(assignment);
    });
    
    // Print schedule by day
    for (const day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']) {
      if (assignmentsByDay[day]) {
        console.log(`\n${day}:`);
        const sortedAssignments = assignmentsByDay[day].sort((a, b) => a.period - b.period);
        
        for (const assignment of sortedAssignments) {
          const classInfo = classes.find(c => c.id === assignment.classId);
          console.log(`  Period ${assignment.period}: ${classInfo?.name || assignment.classId}`);
        }
      }
    }
    
    // Validate schedule
    console.log('\nValidating schedule...');
    const validationResult = await scheduleService.validateSchedule(schedule.id, constraints);
    
    if (validationResult.valid) {
      console.log('Schedule is valid!');
    } else {
      console.log('Schedule has violations:');
      validationResult.violations.forEach(violation => {
        console.log(`  - ${violation.message}`);
      });
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Disconnect Prisma
    await prisma.$disconnect();
  }
}

// Run the test
testSolver().catch(console.error);