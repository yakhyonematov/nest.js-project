import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: Role;
    },
  ) {
    return this.usersService.create(body);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      name: string;
      email: string;
      password: string;
      img: string;
      role: Role;
    }>,
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'image',
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueName = Date.now() + extname(file.originalname);
            cb(null, uniqueName);
          },
        }),
      },
    ),
  )
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Rasm fayli yuklanishi shart!');
    }

    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Foydalanuvchi tizimga kirmagan!');
    }

    if (user.role !== Role.SUPERADMIN && user.sub !== id) {
      throw new ForbiddenException(
        'Siz faqat o\'zingizning profilingiz uchun rasm yuklay olasiz!',
      );
    }

    return this.usersService.updateImage(id, file.filename);
  }
}
