import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UsersService {
  private users = [];
  private idCounter = 1;

  // GET - barcha userlarni olish
  findAll() {
    return this.users;
  }

  // GET BY ID - bitta userni olish
  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // POST - yangi user qo'shish
  create(data: { name: string; age: number; email: string; password: string }) {
    const newUser = {
      id: this.idCounter++,
      name: data.name,
      age: data.age,
      email: data.email,
      password: data.password,
    };
    this.users.push(newUser);
    return newUser;
  }

  // PATCH - userni ma'lumom bir qismini yangilash yangilash
  update(
    id: number,
    data: Partial<{
      name: string;
      age: number;
      email: string;
      password: string;
    }>,
  ) {
    const user = this.findOne(id);
    Object.assign(user, data);
    return user;
  }

  // DELETE - userni o'chirish
  remove(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const deletedUser = this.users[index];
    this.users.splice(index, 1);
    return deletedUser;
  }
}
