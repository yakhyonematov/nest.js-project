import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  createCourse(@Body('title') title: string) {
    return this.courseService.createCourse(title);
  }

  @Post(':id/lessons')
  addLesson(
    @Param('id', ParseIntPipe) courseId: number,
    @Body('title') title: string,
  ) {
    return this.courseService.addLesson(courseId, title);
  }

  @Get()
  getAllCourses() {
    return this.courseService.getAllCourses();
  }
}
