import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // Create a Group (One-to-Many setup)
  async createGroup(name: string) {
    return this.prisma.group.create({
      data: { name },
    });
  }

  // Create a Student
  async createStudent(name: string, groupId?: number) {
    return this.prisma.student.create({
      data: {
        name,
        groupId,
      },
    });
  }

  // Connect Student to Course (Many-to-Many connection)
  async enrollInCourse(studentId: number, courseId: number) {
    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        courses: {
          connect: { id: courseId },
        },
      },
      include: {
        courses: true,
      },
    });
  }

  // Get all Students with relations
  async getAllStudents() {
    return this.prisma.student.findMany({
      include: {
        group: true,     // One-to-Many
        courses: true,   // Many-to-Many
      },
    });
  }
}
