import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  // Create a Course
  async createCourse(title: string) {
    return this.prisma.course.create({
      data: { title },
    });
  }

  // Create a Lesson (One-to-Many setup)
  async addLesson(courseId: number, title: string) {
    return this.prisma.lesson.create({
      data: {
        title,
        courseId,
      },
    });
  }

  // Get all Courses with relations
  async getAllCourses() {
    return this.prisma.course.findMany({
      include: {
        lessons: true,   // One-to-Many
        students: true,  // Many-to-Many
      },
    });
  }
}
