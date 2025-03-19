import { PrismaClient } from '@prisma/client';
import { Day } from '../types';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Clean up existing data
    await prisma.assignment.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.conflict.deleteMany();
    await prisma.class.deleteMany();
    await prisma.teacherAvailability.deleteMany();

    // Create test classes
    const classes = [
      {
        name: 'Class 1A',
        gradeLevel: 1,
        conflicts: [
          {
            day: Day.MONDAY,
            periods: [1, 2]
          },
          {
            day: Day.WEDNESDAY,
            periods: [3, 4]
          }
        ]
      },
      {
        name: 'Class 2B',
        gradeLevel: 2,
        conflicts: [
          {
            day: Day.TUESDAY,
            periods: [2, 3]
          },
          {
            day: Day.THURSDAY,
            periods: [1, 4]
          }
        ]
      },
      {
        name: 'Class 3C',
        gradeLevel: 3,
        conflicts: [
          {
            day: Day.MONDAY,
            periods: [3, 4]
          },
          {
            day: Day.FRIDAY,
            periods: [1, 2]
          }
        ]
      }
    ];

    // Insert classes with their conflicts
    for (const classData of classes) {
      await prisma.class.create({
        data: {
          name: classData.name,
          gradeLevel: classData.gradeLevel,
          conflicts: {
            create: classData.conflicts
          }
        }
      });
    }

    // Create a test schedule
    const schedule = await prisma.schedule.create({
      data: {
        startDate: new Date('2025-03-18'),
        endDate: new Date('2025-03-22'),
        rotationWeeks: 1
      }
    });

    // Create some test assignments
    const assignments = [
      {
        classId: '1', // This will be replaced with actual class ID
        day: Day.MONDAY,
        period: 3,
        week: 1,
        scheduleId: schedule.id
      },
      {
        classId: '2', // This will be replaced with actual class ID
        day: Day.TUESDAY,
        period: 4,
        week: 1,
        scheduleId: schedule.id
      }
    ];

    // Get the created classes to use their IDs
    const createdClasses = await prisma.class.findMany();
    
    // Create assignments with actual class IDs
    for (let i = 0; i < assignments.length; i++) {
      await prisma.assignment.create({
        data: {
          ...assignments[i],
          classId: createdClasses[i].id
        }
      });
    }

    // Create some test teacher availability
    const availability = [
      {
        date: new Date('2025-03-18'),
        blockedPeriods: [1, 2],
        reason: 'Morning meeting'
      },
      {
        date: new Date('2025-03-19'),
        blockedPeriods: [3, 4],
        reason: 'Afternoon workshop'
      }
    ];

    for (const avail of availability) {
      await prisma.teacherAvailability.create({
        data: avail
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();