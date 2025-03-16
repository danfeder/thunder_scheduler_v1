import { PrismaClient, Day as PrismaDay } from '@prisma/client';
import {
  BaseSchedule,
  BaseAssignment,
  ScheduleGenerationRequest,
  ScheduleWithAssignments,
  ClassWithConflicts,
  BaseTeacherAvailability,
  ScheduleConstraints,
  Day,
  BaseConflict
} from '../types';
import { SolverService } from './solver.service';
import { ClassService } from './class.service';

export class ScheduleService {
  private solverService: SolverService;
  private classService: ClassService;
  
  constructor(private prisma: PrismaClient) {
    this.solverService = new SolverService();
    this.classService = new ClassService(prisma);
  }
  
  /**
   * Generate a new schedule based on the given request
   * @param request Schedule generation request with constraints
   * @returns The generated schedule with assignments
   */
  /**
   * Convert Prisma Day enum to application Day enum
   */
  private _convertPrismaDay(prismaDay: PrismaDay): Day {
    // Map Prisma Day enum values to application Day enum values
    const dayMap: Record<PrismaDay, Day> = {
      [PrismaDay.MONDAY]: Day.MONDAY,
      [PrismaDay.TUESDAY]: Day.TUESDAY,
      [PrismaDay.WEDNESDAY]: Day.WEDNESDAY,
      [PrismaDay.THURSDAY]: Day.THURSDAY,
      [PrismaDay.FRIDAY]: Day.FRIDAY
    };
    return dayMap[prismaDay];
  }
  
  /**
   * Convert Prisma class with conflicts to application ClassWithConflicts
   */
  private _convertPrismaClass(prismaClass: any): ClassWithConflicts {
    return {
      ...prismaClass,
      conflicts: prismaClass.conflicts.map((conflict: any) => ({
        ...conflict,
        day: this._convertPrismaDay(conflict.day)
      }))
    };
  }
  
  /**
   * Convert Prisma teacher availability to application BaseTeacherAvailability
   */
  private _convertPrismaTeacherAvailability(prismaAvailability: any): BaseTeacherAvailability {
    return {
      ...prismaAvailability,
      reason: prismaAvailability.reason || undefined
    };
  }

  async generateSchedule(request: ScheduleGenerationRequest): Promise<ScheduleWithAssignments> {
    // Get all classes with conflicts
    const prismaClasses = await this.classService.getAllClasses();
    const classes = prismaClasses.map(cls => this._convertPrismaClass(cls));
    
    // Get teacher availability for the schedule period
    const prismaAvailability = await this.getTeacherAvailability(
      request.startDate,
      request.endDate
    );
    const teacherAvailability = prismaAvailability.map(
      (avail: any) => this._convertPrismaTeacherAvailability(avail)
    );
    
    // Generate assignments using solver
    const assignmentsWithoutIds = await this.solverService.generateSchedule(
      classes,
      teacherAvailability,
      request
    );
    
    // Create schedule in database
    const schedule = await this.prisma.schedule.create({
      data: {
        startDate: request.startDate,
        endDate: request.endDate,
        rotationWeeks: request.rotationWeeks
      }
    });
    
    // Create assignments in database one by one to generate unique IDs
    for (const assignment of assignmentsWithoutIds) {
      await this.prisma.assignment.create({
        data: {
          ...assignment,
          scheduleId: schedule.id
        }
      });
    }
    
    // Return complete schedule with assignments
    return this.getScheduleById(schedule.id);
  }
  
  /**
   * Get a schedule by ID with all assignments
   * @param id Schedule ID
   * @returns Schedule with assignments
   */
  async getScheduleById(id: string): Promise<ScheduleWithAssignments> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        assignments: true
      }
    });
    
    if (!schedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    return schedule as ScheduleWithAssignments;
  }
  
  /**
   * Get all schedules
   * @returns List of schedules
   */
  async getAllSchedules(): Promise<BaseSchedule[]> {
    return this.prisma.schedule.findMany();
  }
  
  /**
   * Get teacher availability for a date range
   * @param startDate Start date
   * @param endDate End date
   * @returns List of teacher availability records
   */
  async getTeacherAvailability(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return this.prisma.teacherAvailability.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }
  
  /**
   * Get teacher availability for a date range and convert to application type
   * @param startDate Start date
   * @param endDate End date
   * @returns List of teacher availability records
   */
  async getTeacherAvailabilityConverted(
    startDate: Date,
    endDate: Date
  ): Promise<BaseTeacherAvailability[]> {
    const prismaAvailability = await this.getTeacherAvailability(startDate, endDate);
    return prismaAvailability.map(
      (avail: any) => this._convertPrismaTeacherAvailability(avail)
    );
  }
  
  /**
   * Create a new teacher availability record
   * @param data Teacher availability data
   * @returns Created teacher availability record
   */
  async createTeacherAvailability(
    data: Omit<BaseTeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BaseTeacherAvailability> {
    const prismaResult = await this.prisma.teacherAvailability.create({
      data: {
        ...data,
        reason: data.reason || null
      }
    });
    return this._convertPrismaTeacherAvailability(prismaResult);
  }
  
  /**
   * Delete a teacher availability record
   * @param id Teacher availability ID
   * @returns Deleted teacher availability record
   */
  async deleteTeacherAvailability(id: string): Promise<BaseTeacherAvailability> {
    const prismaResult = await this.prisma.teacherAvailability.delete({
      where: { id }
    });
    return this._convertPrismaTeacherAvailability(prismaResult);
  }
  
  /**
   * Validate a schedule against constraints
   * @param scheduleId Schedule ID
   * @param constraints Schedule constraints
   * @returns Validation result with any violations
   */
  async validateSchedule(
    scheduleId: string,
    constraints: ScheduleConstraints
  ): Promise<{ valid: boolean; violations: any[] }> {
    const schedule = await this.getScheduleById(scheduleId);
    
    // Get classes and convert to application types
    const prismaClasses = await this.classService.getAllClasses();
    const classes = prismaClasses.map(cls => this._convertPrismaClass(cls));
    
    // Get teacher availability and convert to application types
    const prismaAvailability = await this.getTeacherAvailability(
      schedule.startDate,
      schedule.endDate
    );
    const teacherAvailability = prismaAvailability.map(
      (avail: any) => this._convertPrismaTeacherAvailability(avail)
    );
    
    return this.solverService.validateSchedule(
      schedule.assignments,
      classes,
      teacherAvailability,
      constraints
    );
  }
  
  /**
   * Delete a schedule and all its assignments
   * @param id Schedule ID
   * @returns Deleted schedule
   */
  async deleteSchedule(id: string): Promise<BaseSchedule> {
    return this.prisma.schedule.delete({
      where: { id }
    });
  }
  
  /**
   * Update a schedule's assignments manually
   * @param scheduleId Schedule ID
   * @param assignments List of assignments
   * @returns Updated schedule with assignments
   */
  async updateScheduleAssignments(
    scheduleId: string,
    assignments: Omit<BaseAssignment, 'id' | 'createdAt' | 'updatedAt' | 'scheduleId'>[]
  ): Promise<ScheduleWithAssignments> {
    // Get the schedule to ensure it exists
    const schedule = await this.getScheduleById(scheduleId);
    
    // Delete existing assignments
    await this.prisma.assignment.deleteMany({
      where: { scheduleId }
    });
    
    // Create new assignments one by one to generate unique IDs
    for (const assignment of assignments) {
      await this.prisma.assignment.create({
        data: {
          ...assignment,
          scheduleId
        }
      });
    }
    
    // Return updated schedule
    return this.getScheduleById(scheduleId);
  }
}