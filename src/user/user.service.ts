import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // GET - barcha userlarni olish
  async findAll() {
    return this.prisma.user.findMany();
  }

  // GET BY ID - bitta userni olish
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // POST - yangi user qo'shish
  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    // Email band emasligini tekshirish
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        "Bu email orqali avval foydalanuvchi ro'yxatdan o'tgan!",
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  // PATCH - userni ma'lumotining bir qismini yangilash
  async update(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      role: Role;
    }>,
  ) {
    // User mavjudligini tekshirish
    await this.findOne(id);

    const updatedData = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'Bu email boshqa foydalanuvchi tomonidan band qilingan!',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updatedData,
    });
  }

  // DELETE - userni o'chirish
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // REGISTER - foydalanuvchini ro'yxatdan o'tkazish
  async register(body: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (existingUser) {
      throw new BadRequestException(
        "Bu email orqali avval foydalanuvchi ro'yxatdan o'tgan!",
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role || 'USER',
      },
    });
  }

  // LOGIN - foydalanuvchini tizimga kiritish
  async login(body: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new BadRequestException("Email yoki parol noto'g'ri!");
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Email yoki parol noto'g'ri!");
    }

    // Parolni xavfsizlik nuqtai nazaridan qaytarmaymiz
    const result = { ...user };
    delete (result as Partial<typeof user>).password;

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      message: 'Tizimga muvaffaqiyatli kirdingiz!',
      access_token,
      user: result,
    };
  }
}
