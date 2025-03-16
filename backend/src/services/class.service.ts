import { PrismaClient } from '@prisma/client';
import { Day } from '../types';

interface ClassCreate {
  name: string;
  gradeLevel: number;
  conflicts: {
    day: Day;
    periods: number[];
  }[];
}

export class ClassService {
  constructor(private prisma: PrismaClient) {}

  async createClass(data: ClassCreate) {
    return this.prisma.class.create({
      data: {
        name: data.name,
        gradeLevel: data.gradeLevel,
        conflicts: {
          create: data.conflicts.map(conflict => ({
            day: conflict.day,
            periods: conflict.periods
          }))
        }
      },
      include: {
        conflicts: true
      }
    });
  }

  async getAllClasses() {
    return this.prisma.class.findMany({
      include: {
        conflicts: true
      }
    });
  }

  async getClassById(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: {
        conflicts: true
      }
    });
  }

  async updateClass(id: string, data: Partial<ClassCreate>) {
    // First update the class basic info
    const updatedClass = await this.prisma.class.update({
      where: { id },
      data: {
        name: data.name,
        gradeLevel: data.gradeLevel,
      }
    });

    // If conflicts are provided, update them
    if (data.conflicts) {
      // Delete existing conflicts
      await this.prisma.conflict.deleteMany({
        where: { classId: id }
      });

      // Create new conflicts
      await this.prisma.conflict.createMany({
        data: data.conflicts.map(conflict => ({
          day: conflict.day,
          periods: conflict.periods,
          classId: id
        }))
      });
    }

    // Return the updated class with conflicts
    return this.getClassById(id);
  }

  async deleteClass(id: string) {
    return this.prisma.class.delete({
      where: { id },
      include: {
        conflicts: true
      }
    });
  }

  async importClassesFromCSV(csvData: string) {
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(',');
    const classes: ClassCreate[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      const className = row[0];
      const gradeLevel = parseInt(className.match(/\d+/)?.[0] || '0');
      const conflicts: { day: Day; periods: number[] }[] = [];

      // Process each day's conflicts
      ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].forEach((day, index) => {
        const periodsStr = row[index + 1];
        if (periodsStr) {
          const periods = periodsStr.split(';').map(p => parseInt(p));
          conflicts.push({
            day: day as Day,
            periods
          });
        }
      });

      classes.push({
        name: className,
        gradeLevel,
        conflicts
      });
    }

    // Create all classes in a transaction
    return this.prisma.$transaction(
      classes.map(classData => 
        this.prisma.class.create({
          data: {
            name: classData.name,
            gradeLevel: classData.gradeLevel,
            conflicts: {
              create: classData.conflicts
            }
          },
          include: {
            conflicts: true
          }
        })
      )
    );
  }
}