import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('group')
  createGroup(@Body('name') name: string) {
    return this.studentService.createGroup(name);
  }

  @Post()
  createStudent(
    @Body('name') name: string,
    @Body('groupId') groupId?: number,
  ) {
    return this.studentService.createStudent(name, groupId);
  }

  @Post(':id/enroll')
  enrollInCourse(
    @Param('id', ParseIntPipe) studentId: number,
    @Body('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.studentService.enrollInCourse(studentId, courseId);
  }

  @Get()
  getAllStudents() {
    return this.studentService.getAllStudents();
  }
}
