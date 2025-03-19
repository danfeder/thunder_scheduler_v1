import prisma from '../lib/prisma';

async function clearData() {
  try {
    // Delete Assignments (must be deleted first due to foreign key constraints)
    await prisma.assignment.deleteMany({});
    console.log('Deleted all assignments');

    // Delete Conflicts
    await prisma.conflict.deleteMany({});
    console.log('Deleted all conflicts');

    // Delete Schedules
    await prisma.schedule.deleteMany({});
    console.log('Deleted all schedules');

    // Delete Classes
    await prisma.class.deleteMany({});
    console.log('Deleted all classes');

    // Delete TeacherAvailability
    await prisma.teacherAvailability.deleteMany({});
    console.log('Deleted all teacher availability records');

    console.log('All data cleared successfully.');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();