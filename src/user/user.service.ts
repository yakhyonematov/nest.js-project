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

  private formatUser(user: any) {
    if (!user) return null;
    const result = { ...user };
    delete result.password;
    if (result.img) {
      result.img = `http://localhost:3000/uploads/${result.img}`;
    }
    return result;
  }

  // GET - barcha userlarni olish
  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.formatUser(user));
  }

  // GET BY ID - bitta userni olish
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.formatUser(user);
  }

  // POST - yangi user qo'shish
  async create(data: {
    name: string;
    email: string;
    password: string;
    img?: string;
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
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    return this.formatUser(user);
  }

  // PATCH - userni ma'lumotining bir qismini yangilash
  async update(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      img: string;
      role: Role;
    }>,
  ) {
    // User mavjudligini tekshirish
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatedData = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.email) {
      const emailCheck = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailCheck && emailCheck.id !== id) {
        throw new BadRequestException(
          'Bu email boshqa foydalanuvchi tomonidan band qilingan!',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updatedData,
    });
    return this.formatUser(user);
  }

  // DELETE - userni o'chirish
  async remove(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return this.formatUser(user);
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
    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        img: body.img,
        role: body.role || 'USER',
      },
    });
    return this.formatUser(user);
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

    const result = this.formatUser(user);

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

  // UPDATE IMAGE - foydalanuvchi rasmini yangilash
  async updateImage(id: number, filename: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { img: filename },
    });
    return this.formatUser(user);
  }
}
